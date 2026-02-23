package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.order.OrderRequest;
import tn.esprit.pi.tbibi.DTO.order.OrderResponse;
import tn.esprit.pi.tbibi.mappers.IOrderMapper;
import tn.esprit.pi.tbibi.entities.*;
import tn.esprit.pi.tbibi.mappers.OrderMapper;
import tn.esprit.pi.tbibi.repositories.OrderLineRepository;
import tn.esprit.pi.tbibi.repositories.OrderRepository;
import tn.esprit.pi.tbibi.repositories.PharmacyRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class OrderService implements IOrderService {

    OrderRepository orderRepo;
    PharmacyRepository pharmacyRepo;
    UserRepository userRepo;
    OrderLineRepository orderLineRepo;
    OrderMapper orderMapper;

    @Override
    public OrderResponse createOrder(OrderRequest request) {
        Pharmacy pharmacy = pharmacyRepo.findById(request.getPharmacyId()).orElseThrow();
        User user = userRepo.findById(request.getUserId()).orElseThrow();
        List<OrderLine> orderLines = orderLineRepo.findAllById(request.getOrderLineIds());
        Order order = orderMapper.toEntity(request);
        order.setPharmacy(pharmacy);
        order.setUser(user);
        order.setOrderLines(orderLines);
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
    public OrderResponse updateOrder(Long id, OrderRequest request) {
        Order order = orderRepo.findById(id).orElseThrow();
        order.setDeliveryDate(request.getDeliveryDate());
        order.setTotalAmount(request.getTotalAmount());
        order.setOrderStatus(Status.valueOf(request.getOrderStatus()));
        order.setOrderDate(request.getOrderDate());
        order.setPharmacy(pharmacyRepo.findById(request.getPharmacyId()).orElseThrow());
        order.setUser(userRepo.findById(request.getUserId()).orElseThrow());
        order.setOrderLines(orderLineRepo.findAllById(request.getOrderLineIds()));
        return orderMapper.toDto(orderRepo.save(order));
    }

    @Override
    public void deleteOrder(Long id) {
        orderRepo.deleteById(id);
    }
}