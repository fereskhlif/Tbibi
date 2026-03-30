package tn.esprit.pi.tbibi.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.pi.tbibi.DTO.order.OrderRequest;
import tn.esprit.pi.tbibi.DTO.order.OrderResponse;
import tn.esprit.pi.tbibi.DTO.orderline.OrderLineRequest;
import tn.esprit.pi.tbibi.DTO.orderline.OrderLineResponse;
import tn.esprit.pi.tbibi.entities.*;
import tn.esprit.pi.tbibi.mappers.OrderLineMapper;
import tn.esprit.pi.tbibi.mappers.OrderMapper;
import tn.esprit.pi.tbibi.repositories.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepo;
    @Mock
    private PharmacyRepository pharmacyRepo;
    @Mock
    private UserRepo userRepo;
    @Mock
    private OrderLineRepository orderLineRepo;
    @Mock
    private OrderMapper orderMapper;
    @Mock
    private MedicineRepository medicineRepo;
    @Mock
    private OrderLineMapper orderLineMapper;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OrderService orderService;

    private User testUser;
    private Pharmacy testPharmacy;
    private Medicine testMedicine;
    private Order testOrder;
    private OrderRequest testRequest;
    private OrderResponse testResponse;

    @BeforeEach
    void setUp() {
        testUser = User.builder().userId(1).name("John Doe").build();
        testPharmacy = Pharmacy.builder().pharmacyId(1L).pharmacyName("Test Pharmacy").build();
        testMedicine = Medicine.builder()
                .medicineId(1L)
                .medicineName("Aspirin")
                .price(10.0f)
                .stock(100)
                .minStockAlert(10)
                .build();

        testOrder = new Order();
        testOrder.setOrderId(1L);
        testOrder.setUser(testUser);
        testOrder.setPharmacy(testPharmacy);
        testOrder.setOrderStatus(Status.PENDING);
        testOrder.setOrderLines(new ArrayList<>());

        testRequest = OrderRequest.builder()
                .userId(1)
                .pharmacyId(1L)
                .orderLines(Arrays.asList(
                        OrderLineRequest.builder().medicineId(1L).quantity(2).build()
                ))
                .build();

        testResponse = OrderResponse.builder()
                .orderId(1L)
                .orderStatus("PENDING")
                .totalAmount(20.0f)
                .build();
    }

    @Test
    void testCreateOrder_Success() {
        when(pharmacyRepo.findById(1L)).thenReturn(Optional.of(testPharmacy));
        when(userRepo.findById(1)).thenReturn(Optional.of(testUser));
        when(userRepo.findByPharmacy_PharmacyId(1L)).thenReturn(Optional.of(testUser));
        when(medicineRepo.findById(1L)).thenReturn(Optional.of(testMedicine));
        when(orderRepo.save(any(Order.class))).thenReturn(testOrder);
        when(orderMapper.toDto(any(Order.class))).thenReturn(testResponse);
        when(orderLineRepo.findByOrderIdWithMedicine(any())).thenReturn(new ArrayList<>());

        OrderResponse result = orderService.createOrder(testRequest);

        assertNotNull(result);
        assertEquals(20.0f, result.getTotalAmount());
        verify(orderRepo, times(1)).save(any(Order.class));
        verify(notificationService, times(1)).createAndSend(any(), any(), any(), any());
    }

    @Test
    void testCreateOrder_OutOfStock() {
        testMedicine.setStock(1); // Only 1 in stock, request asks for 2
        when(pharmacyRepo.findById(1L)).thenReturn(Optional.of(testPharmacy));
        when(userRepo.findById(1)).thenReturn(Optional.of(testUser));
        when(medicineRepo.findById(1L)).thenReturn(Optional.of(testMedicine));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> orderService.createOrder(testRequest));
        assertTrue(exception.getMessage().contains("Not enough stock"));
    }

    @Test
    void testUpdateOrderStatus_Confirmed_Success() {
        OrderLine line = new OrderLine();
        line.setMedicine(testMedicine);
        line.setQuantity(5);
        testOrder.getOrderLines().add(line);

        when(orderRepo.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepo.save(any(Order.class))).thenReturn(testOrder);
        when(orderMapper.toDto(any(Order.class))).thenReturn(testResponse);
        when(orderLineRepo.findByOrderIdWithMedicine(any())).thenReturn(new ArrayList<>());
        when(medicineRepo.save(any(Medicine.class))).thenReturn(testMedicine);

        OrderResponse result = orderService.updateOrderStatus(1L, "CONFIRMED");

        assertEquals(95, testMedicine.getStock()); // 100 - 5
        verify(medicineRepo, times(1)).save(testMedicine);
        verify(notificationService, atLeastOnce()).createAndSend(any(), any(), any(), any());
    }

    @Test
    void testUpdateOrderStatus_Delivered_Success() {
        when(orderRepo.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepo.save(any(Order.class))).thenReturn(testOrder);
        when(orderMapper.toDto(any(Order.class))).thenReturn(testResponse);
        when(orderLineRepo.findByOrderIdWithMedicine(any())).thenReturn(new ArrayList<>());

        OrderResponse result = orderService.updateOrderStatus(1L, "DELIVERED");

        assertNotNull(testOrder.getDeliveryDate());
        assertEquals(Status.DELIVERED, testOrder.getOrderStatus());
    }

    @Test
    void testGetOrdersByPharmacy_Success() {
        when(orderRepo.findByPharmacy_PharmacyId(1L)).thenReturn(Arrays.asList(testOrder));
        when(orderMapper.toDto(any(Order.class))).thenReturn(testResponse);
        when(orderLineRepo.findByOrderIdWithMedicine(any())).thenReturn(new ArrayList<>());

        List<OrderResponse> result = orderService.getOrdersByPharmacy(1L);

        assertEquals(1, result.size());
        verify(orderRepo, times(1)).findByPharmacy_PharmacyId(1L);
    }
}
