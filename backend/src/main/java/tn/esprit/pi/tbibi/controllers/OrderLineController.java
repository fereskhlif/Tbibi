package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.orderline.OrderLineRequest;
import tn.esprit.pi.tbibi.DTO.orderline.OrderLineResponse;
import tn.esprit.pi.tbibi.services.IOrderLineService;

import java.util.List;

@RestController
@RequestMapping("/api/orderlines")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class OrderLineController {

    IOrderLineService orderLineService;

    @PostMapping
    public OrderLineResponse create(@RequestBody OrderLineRequest request) {
        return orderLineService.createOrderLine(request);
    }

    @GetMapping("/{id}")
    public OrderLineResponse getById(@PathVariable Long id) {
        return orderLineService.getOrderLineById(id);
    }

    @GetMapping
    public List<OrderLineResponse> getAll() {
        return orderLineService.getAllOrderLines();
    }

    @PutMapping("/{id}")
    public OrderLineResponse update(@PathVariable Long id, @RequestBody OrderLineRequest request) {
        return orderLineService.updateOrderLine(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        orderLineService.deleteOrderLine(id);
    }
}
