package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.order.OrderRequest;
import tn.esprit.pi.tbibi.DTO.order.OrderResponse;

import java.util.List;

public interface IOrderService {
    OrderResponse createOrder(OrderRequest request);
    OrderResponse getOrderById(Long id);
    List<OrderResponse> getAllOrders();
    OrderResponse updateOrderStatus(Long id, String status);
    void deleteOrder(Long id);
    List<OrderResponse> getOrdersByUser(Integer userId);
    List<OrderResponse> getPendingOrders();

}
