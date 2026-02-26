package tn.esprit.pi.tbibi.ai;

import org.springframework.stereotype.Service;

@Service
public class RiskAIService {

    public String calculateRisk(int age, boolean hasDiabetes, double glucose) {

        int score = 0;

        if (age > 60) score += 2;
        if (hasDiabetes) score += 3;
        if (glucose > 140) score += 2;

        if (score >= 5) return "HIGH RISK";
        if (score >= 3) return "MEDIUM RISK";
        return "LOW RISK";
    }
}
