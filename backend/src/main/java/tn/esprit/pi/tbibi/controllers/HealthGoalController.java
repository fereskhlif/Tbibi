package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.*;
import tn.esprit.pi.tbibi.services.IHealthGoalService;

import java.util.List;

@RestController
@RequestMapping("/health-goal")
@RequiredArgsConstructor
public class HealthGoalController {

    private final IHealthGoalService service;

    @GetMapping
    public List<HealthGoalResponse> getAll() {
        return service.getAll();
    }

    @PostMapping
    public HealthGoalResponse add(@RequestBody HealthGoalRequest request) {
        return service.add(request);
    }

    @PutMapping("/{id}")
    public HealthGoalResponse update(@PathVariable Long id,
                                     @RequestBody HealthGoalRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}