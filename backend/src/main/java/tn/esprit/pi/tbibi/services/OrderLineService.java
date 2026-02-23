package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.orderline.OrderLineRequest;
import tn.esprit.pi.tbibi.DTO.orderline.OrderLineResponse;
import tn.esprit.pi.tbibi.mappers.OrderLineMapper;
import tn.esprit.pi.tbibi.entities.Medicine;
import tn.esprit.pi.tbibi.entities.OrderLine;
import tn.esprit.pi.tbibi.repositories.MedicineRepository;
import tn.esprit.pi.tbibi.repositories.OrderLineRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class OrderLineService implements IOrderLineService {

    OrderLineRepository orderLineRepo;
    MedicineRepository medicineRepo;
    OrderLineMapper orderLineMapper;

    @Override
    public OrderLineResponse createOrderLine(OrderLineRequest request) {
        Medicine medicine = medicineRepo.findById(request.getMedicineId()).orElseThrow();
        OrderLine orderLine = orderLineMapper.toEntity(request);
        orderLine.setMedicine(medicine);
        return orderLineMapper.toDto(orderLineRepo.save(orderLine));
    }

    @Override
    public OrderLineResponse getOrderLineById(Long id) {
        return orderLineMapper.toDto(orderLineRepo.findById(id).orElseThrow());
    }

    @Override
    public List<OrderLineResponse> getAllOrderLines() {
        return orderLineRepo.findAll().stream().map(orderLineMapper::toDto).toList();
    }

    @Override
    public OrderLineResponse updateOrderLine(Long id, OrderLineRequest request) {
        OrderLine orderLine = orderLineRepo.findById(id).orElseThrow();
        Medicine medicine = medicineRepo.findById(request.getMedicineId()).orElseThrow();
        orderLine.setQuantity(request.getQuantity());
        orderLine.setUnitPrice(request.getUnitPrice());
        orderLine.setMedicine(medicine);
        return orderLineMapper.toDto(orderLineRepo.save(orderLine));
    }

    @Override
    public void deleteOrderLine(Long id) {
        orderLineRepo.deleteById(id);
    }
}