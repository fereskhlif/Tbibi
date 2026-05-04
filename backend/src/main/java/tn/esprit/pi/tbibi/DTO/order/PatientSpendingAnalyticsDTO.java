package tn.esprit.pi.tbibi.DTO.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.pi.tbibi.entities.MedicineCategory;
import tn.esprit.pi.tbibi.entities.MedicineForm;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientSpendingAnalyticsDTO {
    private MedicineCategory category;
    private MedicineForm form;
    private Long orderCount;
    private Long totalUnits;
    private Double totalSpent;
    private String mostBoughtMedicine;
}
