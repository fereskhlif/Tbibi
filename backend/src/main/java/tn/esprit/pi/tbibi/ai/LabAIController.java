package tn.esprit.pi.tbibi.ai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class LabAIController {

    @Autowired
    private LabAIService service;

    @Autowired
    private RiskAIService riskService;

    @GetMapping("/check-lab")
    public String checkLab(@RequestParam String testName,
                           @RequestParam double value) {

        return service.interpretResult(testName, value);
    }

    @GetMapping("/risk")
    public String getRisk(
            @RequestParam int age,
            @RequestParam boolean hasDiabetes,
            @RequestParam double glucose) {

        return riskService.calculateRisk(age, hasDiabetes, glucose);
    }
}

