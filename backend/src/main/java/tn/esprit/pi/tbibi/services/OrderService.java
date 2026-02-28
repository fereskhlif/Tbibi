package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.order.OrderRequest;
import tn.esprit.pi.tbibi.DTO.order.OrderResponse;
import tn.esprit.pi.tbibi.DTO.orderline.OrderLineRequest;
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

    @Override
    public OrderResponse createOrder(OrderRequest request) {
        Pharmacy pharmacy = pharmacyRepo.findById(request.getPharmacyId()).orElseThrow();
        User user = userRepo.findById(request.getUserId()).orElseThrow();

        // create order first
        Order order = new Order();
        order.setPharmacy(pharmacy);
        order.setUser(user);
        order.setOrderDate(new Date());
        order.setOrderStatus(Status.PENDING);

        // create orderlines from request
        List<OrderLine> orderLines = new ArrayList<>();
        float totalAmount = 0;

        for (OrderLineRequest lineRequest : request.getOrderLines()) {
            Medicine medicine = medicineRepo.findById(lineRequest.getMedicineId()).orElseThrow();

            // ✅ check if enough stock
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
        return orderMapper.toDto(orderRepo.save(order));
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        return orderMapper.toDto(orderRepo.findById(id).orElseThrow());
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepo.findAll().stream().map(orderMapper::toDto).toList();
    }


    @Override
    public OrderResponse updateOrderStatus(Long id, String status) {
        Order order = orderRepo.findById(id).orElseThrow();
        order.setOrderStatus(Status.valueOf(status));

        if (Status.valueOf(status) == Status.DELIVERED) {
            order.setDeliveryDate(new Date());
        }

        return orderMapper.toDto(orderRepo.save(order));
    }

    // ✅ patient sees his own orders
    @Override
    public List<OrderResponse> getOrdersByUser(Integer userId) {
        return orderRepo.findByUser_UserId(userId)
                .stream()
                .map(orderMapper::toDto)
                .toList();
    }

    // ✅ pharmacist sees pending orders
    @Override
    public List<OrderResponse> getPendingOrders() {
        return orderRepo.findByOrderStatus(Status.PENDING)
                .stream()
                .map(orderMapper::toDto)
                .toList();
    }



    @Override
    public void deleteOrder(Long id) {
        orderRepo.deleteById(id);
    }
}