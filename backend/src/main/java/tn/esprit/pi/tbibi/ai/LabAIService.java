package tn.esprit.pi.tbibi.ai;


import org.springframework.stereotype.Service;

@Service
public class LabAIService {

    public String interpretResult(String testName, double value) {

        if (testName.equalsIgnoreCase("glucose")) {
            if (value < 70) return "LOW";
            if (value > 110) return "HIGH";
            return "NORMAL";
        }

        if (testName.equalsIgnoreCase("hemoglobin")) {
            if (value < 12) return "LOW";
            if (value > 16) return "HIGH";
            return "NORMAL";
        }

        return "UNKNOWN TEST";
    }
}


