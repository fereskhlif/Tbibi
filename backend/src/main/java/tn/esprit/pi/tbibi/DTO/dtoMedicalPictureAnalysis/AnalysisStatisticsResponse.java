package tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisStatisticsResponse {
    
    // Statistiques globales
    private Long totalAnalyses;
    private Long completedAnalyses;
    private Long pendingAnalyses;
    
    // Détection de fractures
    private Long fractureDetected;
    private Long noFractureDetected;
    private Double fractureRate; // Pourcentage
    
    // Distribution par catégorie
    private Map<String, Long> analysesByCategory;
    
    // Distribution par statut
    private Map<String, Long> analysesByStatus;
    
    // Confiance moyenne
    private Double averageConfidence;
    private Long highConfidenceCount;   // >= 80%
    private Long mediumConfidenceCount; // 60-80%
    private Long lowConfidenceCount;    // < 60%
    
    // Évolution temporelle (7 derniers jours)
    private Map<String, Long> analysesLast7Days;
}
