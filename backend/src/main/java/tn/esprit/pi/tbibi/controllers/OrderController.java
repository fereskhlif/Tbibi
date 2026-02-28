package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.order.OrderRequest;
import tn.esprit.pi.tbibi.DTO.order.OrderResponse;
import tn.esprit.pi.tbibi.services.IOrderService;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class OrderController {

    IOrderService orderService;

    @PostMapping
    public OrderResponse createOrder(@RequestBody OrderRequest request) {
        return orderService.createOrder(request);
    }

    @GetMapping("/{id}")
    public OrderResponse getOrderById(@PathVariable("id") Long id) {
        return orderService.getOrderById(id);
    }

    @GetMapping
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PutMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable("id") Long id, @RequestParam("status") String status) {
        return orderService.updateOrderStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable("id") Long id) {
        orderService.deleteOrder(id);
    }

    @GetMapping("/user/{userId}")
    public List<OrderResponse> getOrdersByUser(@PathVariable("userId") Integer userId) {
        return orderService.getOrdersByUser(userId);
    }

    @GetMapping("/pending")
    public List<OrderResponse> getPendingOrders() {
        return orderService.getPendingOrders();
    }
}