package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.orderline.OrderLineRequest;
import tn.esprit.pi.tbibi.DTO.orderline.OrderLineResponse;

import java.util.List;

public interface IOrderLineService {
    OrderLineResponse createOrderLine(OrderLineRequest request);
    OrderLineResponse getOrderLineById(Long id);
    List<OrderLineResponse> getAllOrderLines();
    OrderLineResponse updateOrderLine(Long id, OrderLineRequest request);
    void deleteOrderLine(Long id);
}
