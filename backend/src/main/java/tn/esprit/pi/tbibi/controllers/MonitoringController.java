package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.MonitoringRequest;
import tn.esprit.pi.tbibi.DTO.MonitoringResponse;
import tn.esprit.pi.tbibi.services.IMonitoringService;

import java.util.List;

@RestController
@RequestMapping("/monitoring")
@RequiredArgsConstructor
public class MonitoringController {

    private final IMonitoringService service;

    @GetMapping
    public List<MonitoringResponse> getAll() {
        return service.getAll();
    }

    @PostMapping
    public MonitoringResponse add(@RequestBody MonitoringRequest request) {
        return service.add(request);
    }

    @PutMapping("/{id}")
    public MonitoringResponse update(@PathVariable Long id,
                                     @RequestBody MonitoringRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}