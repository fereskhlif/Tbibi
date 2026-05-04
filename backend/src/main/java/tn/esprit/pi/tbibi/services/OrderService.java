package tn.esprit.pi.tbibi.services;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.order.OrderRequest;
import tn.esprit.pi.tbibi.DTO.order.OrderResponse;
import tn.esprit.pi.tbibi.DTO.orderline.OrderLineRequest;
import tn.esprit.pi.tbibi.DTO.orderline.OrderLineResponse;
import tn.esprit.pi.tbibi.mappers.OrderLineMapper;
import tn.esprit.pi.tbibi.mappers.OrderMapper;
import tn.esprit.pi.tbibi.entities.*;
import tn.esprit.pi.tbibi.repositories.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@AllArgsConstructor
public class OrderService implements IOrderService {

    OrderRepository orderRepo;
    PharmacyRepository pharmacyRepo;
    UserRepo userRepo;
    OrderLineRepository orderLineRepo;
    OrderMapper orderMapper;
    MedicineRepository medicineRepo;
    OrderLineMapper orderLineMapper;
    NotificationService notificationService;
    PrescriptionRepo prescriptionRepo;

    // ─── Helper: maps an Order and loads its lines with medicine name ──────────
    private OrderResponse mapWithLines(Order order) {
        OrderResponse dto = orderMapper.toDto(order);
        List<OrderLineResponse> lines = orderLineRepo
                .findByOrderIdWithMedicine(order.getOrderId())
                .stream()
                .map(orderLineMapper::toDto)
                .toList();
        dto.setOrderLines(lines);
        return dto;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Pharmacy pharmacy = pharmacyRepo.findById(request.getPharmacyId()).orElseThrow();
        User user = userRepo.findById(request.getUserId()).orElseThrow();

        Order order = new Order();
        order.setPharmacy(pharmacy);
        order.setUser(user);
        order.setOrderDate(new Date());
        order.setOrderStatus(Status.PENDING);
        order.setDeliveryMethod(request.getDeliveryMethod());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPrescriptionImage(request.getPrescriptionImage());

        List<OrderLine> orderLines = new ArrayList<>();
        float totalAmount = 0;

        for (OrderLineRequest lineRequest : request.getOrderLines()) {
            Medicine medicine = medicineRepo.findById(lineRequest.getMedicineId()).orElseThrow();

            if (medicine.getStock() < lineRequest.getQuantity()) {
                throw new RuntimeException("Not enough stock for: " + medicine.getMedicineName());
            }

            OrderLine orderLine = new OrderLine();
            orderLine.setMedicine(medicine);
            orderLine.setQuantity(lineRequest.getQuantity());
            orderLine.setUnitPrice(medicine.getPrice());
            orderLine.setOrder(order);
            orderLines.add(orderLine);

            totalAmount += medicine.getPrice() * lineRequest.getQuantity();
        }

        order.setOrderLines(orderLines);
        order.setTotalAmount(totalAmount);

        // ─── Prescription Verification ──────────────────────────────
        List<Prescription> patientPrescriptions = prescriptionRepo.findByPatientId(user.getUserId());

        for (OrderLine line : orderLines) {
            Medicine med = line.getMedicine();
            if (med.isPrescriptionRequired()) {
                boolean found = false;
                String target = med.getMedicineName().toLowerCase().trim();

                for (Prescription p : patientPrescriptions) {
                    if (p.getStatus() != PrescriptionStatus.VALIDATED && p.getStatus() != PrescriptionStatus.PENDING)
                        continue;

                    // Check linked medicines
                    if (p.getMedicines() != null) {
                        for (Medicine pm : p.getMedicines()) {
                            if (isSimilarityMatch(pm.getMedicineName().toLowerCase(), target)) {
                                found = true;
                                break;
                            }
                        }
                    }
                    if (found)
                        break;

                    // Check manual treatments
                    if (p.getTreatments() != null) {
                        for (Treatment t : p.getTreatments()) {
                            if (isSimilarityMatch(t.getDescription().toLowerCase(), target)) {
                                found = true;
                                break;
                            }
                        }
                    }
                    if (found)
                        break;

                    // Check Prescription Notes (Added for testing flexibility)
                    if (p.getNote() != null) {
                        if (isSimilarityMatch(p.getNote().toLowerCase(), target)) {
                            found = true;
                        }
                    }
                    if (found)
                        break;
                }

                if (!found) {
                    throw new RuntimeException("Prescription required for: " + med.getMedicineName() +
                            ". Please contact your doctor to add a digital prescription.");
                }
            }
        }

        Order saved = orderRepo.save(order);

        // ─── Notify pharmacist of new order ───────────────────────────────
        userRepo.findByPharmacy_PharmacyId(pharmacy.getPharmacyId())
                .ifPresent(pharmacist -> notificationService.createAndSend(
                        pharmacist,
                        "New order from " + user.getName() + " — " + orderLines.size() + " item(s)",
                        NotificationType.ORDER,
                        "/pharmacist/orders"));

        return mapWithLines(saved);
    }

    @Override
    @Transactional
    public OrderResponse getOrderById(Long id) {
        return mapWithLines(orderRepo.findById(id).orElseThrow());
    }

    @Override
    @Transactional
    public List<OrderResponse> getAllOrders() {
        return orderRepo.findAll().stream()
                .map(this::mapWithLines)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status) {
        Order order = orderRepo.findById(id).orElseThrow();
        order.setOrderStatus(Status.valueOf(status));

        if (Status.valueOf(status) == Status.DELIVERED) {
            order.setDeliveryDate(new Date());
        }

        if (Status.valueOf(status) == Status.CONFIRMED) {
            for (OrderLine line : order.getOrderLines()) {
                Medicine medicine = line.getMedicine();
                if (medicine.getStock() < line.getQuantity()) {
                    throw new RuntimeException(
                            "Cannot confirm order. Not enough stock for: " + medicine.getMedicineName());
                }

                medicine.setStock(medicine.getStock() - line.getQuantity());
                medicineRepo.save(medicine);

                // ─── Low stock alert ──────────────────────────────────────────
                if (medicine.getStock() < medicine.getMinStockAlert()) {
                    userRepo.findByPharmacy_PharmacyId(order.getPharmacy().getPharmacyId())
                            .ifPresent(pharmacist -> notificationService.createAndSend(
                                    pharmacist,
                                    "⚠️ Low stock: " + medicine.getMedicineName() +
                                            " has only " + medicine.getStock() + " units left!",
                                    NotificationType.ORDER,
                                    "/pharmacist/medicines"));
                }
            }
        }

        Order saved = orderRepo.save(order);

        // ─── Notify user about order status change ────────────────────────
        String statusMsg = switch (Status.valueOf(status)) {
            case CONFIRMED -> "✅ Your order has been confirmed!";
            case REJECTED -> "❌ Your order has been rejected.";
            case DELIVERED -> "📦 Your order has been delivered!";
            case IN_PROGRESS -> "🔄 Your order is being prepared.";
            default -> null;
        };
        if (statusMsg != null) {
            notificationService.createAndSend(
                    order.getUser(),
                    statusMsg,
                    NotificationType.ORDER,
                    "/patient/orders");
        }

        return mapWithLines(saved);
    }

    @Override
    @Transactional
    public List<OrderResponse> getOrdersByUser(Integer userId) {
        return orderRepo.findByUser_UserId(userId)
                .stream()
                .map(this::mapWithLines)
                .toList();
    }

    @Override
    @Transactional
    public List<OrderResponse> getPendingOrders() {
        return orderRepo.findByOrderStatus(Status.PENDING)
                .stream()
                .map(this::mapWithLines)
                .toList();
    }

    @Override
    @Transactional
    public List<OrderResponse> getOrdersByPharmacy(Long pharmacyId) {
        return orderRepo.findByPharmacy_PharmacyId(pharmacyId)
                .stream()
                .map(this::mapWithLines)
                .toList();
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        orderRepo.deleteById(id);
    }

    @Override
    @Transactional
    public List<OrderResponse> getOrdersByPharmacyAndUserEmail(Long pharmacyId, String email) {
        return orderRepo.findByPharmacy_PharmacyIdAndUser_EmailOrderByOrderDateDesc(pharmacyId, email)
                .stream()
                .map(this::mapWithLines)
                .toList();
    }

    @Override
    @Transactional
    public org.springframework.data.domain.Page<OrderResponse> getOrdersPaginated(Long pharmacyId, String status,
            String search, String sortType, int page, int size) {
        org.springframework.data.domain.Sort sort;
        switch (sortType != null ? sortType : "newest") {
            case "oldest":
                sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC,
                        "orderDate");
                break;
            case "highest":
                sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,
                        "totalAmount");
                break;
            case "lowest":
                sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC,
                        "totalAmount");
                break;
            case "newest":
            default:
                sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,
                        "orderDate");
                break;
        }
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                sort);
        Status enumStatus = ("ALL".equalsIgnoreCase(status) || status == null || status.isBlank()) ? null
                : Status.valueOf(status);
        String searchParam = (search == null || search.isBlank()) ? null : search;

        return orderRepo.searchOrdersPaginated(pharmacyId, enumStatus, searchParam, pageable)
                .map(this::mapWithLines);
    }

    @Override
    @Transactional
    public org.springframework.data.domain.Page<OrderResponse> getUserOrdersPaginated(Integer userId, String status,
            String search, String sortType, int page, int size) {
        org.springframework.data.domain.Sort sort;
        switch (sortType != null ? sortType : "newest") {
            case "oldest":
                sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC,
                        "orderDate");
                break;
            case "highest":
                sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,
                        "totalAmount");
                break;
            case "lowest":
                sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC,
                        "totalAmount");
                break;
            case "newest":
            default:
                sort = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,
                        "orderDate");
                break;
        }
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                sort);
        Status enumStatus = ("ALL".equalsIgnoreCase(status) || status == null || status.isBlank()) ? null
                : Status.valueOf(status);
        String searchParam = (search == null || search.isBlank()) ? null : search;

        return orderRepo.searchUserOrdersPaginated(userId, enumStatus, searchParam, pageable)
                .map(this::mapWithLines);
    }

    @Override
    @Transactional
    public List<tn.esprit.pi.tbibi.DTO.order.PatientSpendingAnalyticsDTO> getPatientSpendingAnalytics(
            Integer patientId) {
        return orderRepo.getPatientSpendingAnalytics(patientId);
    }

    @Override
    @Transactional
    public List<tn.esprit.pi.tbibi.DTO.order.MedicinePurchaseHistoryDTO> getMedicinePurchaseHistory(Integer userId,
            String medicineName) {
        return orderRepo.getMedicinePurchaseHistory(userId, medicineName);
    }

    @Override
    @Transactional
    public List<tn.esprit.pi.tbibi.DTO.order.MedicinePurchaseHistoryDTO> getAllPatientMedicineHistory(Integer userId) {
        return orderRepo.getAllPatientMedicineHistory(userId);
    }

    private boolean isSimilarityMatch(String prescribed, String pharmacy) {
        if (prescribed == null || pharmacy == null)
            return false;
        prescribed = prescribed.trim();
        pharmacy = pharmacy.trim();

        // Direct or partial match
        if (prescribed.contains(pharmacy) || pharmacy.contains(prescribed))
            return true;

        // Fuzzy match (Levenshtein Distance)
        int distance = calculateLevenshteinDistance(prescribed, pharmacy);
        int maxLength = Math.max(prescribed.length(), pharmacy.length());
        float similarity = 1.0f - ((float) distance / maxLength);

        return similarity > 0.7; // 70% similarity threshold
    }

    private int calculateLevenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        for (int i = 0; i <= s1.length(); i++)
            dp[i][0] = i;
        for (int j = 0; j <= s2.length(); j++)
            dp[0][j] = j;

        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                int cost = (s1.charAt(i - 1) == s2.charAt(j - 1)) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1), dp[i - 1][j - 1] + cost);
            }
        }
        return dp[s1.length()][s2.length()];
    }
}