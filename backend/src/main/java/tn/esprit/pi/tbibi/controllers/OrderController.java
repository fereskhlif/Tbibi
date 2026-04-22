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

    @GetMapping("/pharmacy/{pharmacyId}")  // ✅ added - before /{id}

    public List<OrderResponse> getOrdersByPharmacy(@PathVariable("pharmacyId") Long pharmacyId) {
        return orderService.getOrdersByPharmacy(pharmacyId);
    }

    @GetMapping("/pharmacy/{pharmacyId}/user/{email}")
    public List<OrderResponse> getOrdersByPharmacyAndUserEmail(
            @PathVariable("pharmacyId") Long pharmacyId, 
            @PathVariable("email") String email) {
        return orderService.getOrdersByPharmacyAndUserEmail(pharmacyId, email);
    }

    @GetMapping("/pending")
    public List<OrderResponse> getPendingOrders() {
        return orderService.getPendingOrders();
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

    @GetMapping("/pharmacy/{pharmacyId}/paged")
    public org.springframework.data.domain.Page<OrderResponse> getOrdersPaginated(
            @PathVariable("pharmacyId") Long pharmacyId,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "newest") String sortType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return orderService.getOrdersPaginated(pharmacyId, status, search, sortType, page, size);
    }

    @GetMapping("/user/{userId}/paged")
    public org.springframework.data.domain.Page<OrderResponse> getUserOrdersPaginated(
            @PathVariable("userId") Integer userId,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "newest") String sortType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return orderService.getUserOrdersPaginated(userId, status, search, sortType, page, size);
    }
}