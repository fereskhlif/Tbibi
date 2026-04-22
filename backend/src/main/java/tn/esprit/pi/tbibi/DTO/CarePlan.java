package tn.esprit.pi.tbibi.DTO;

import lombok.*;
import java.util.List;

/**
 * A structured care plan generated for a patient based on their
 * risk cluster and individual vital readings.
 *
 * Each {@link Section} corresponds to one health concern (e.g. blood sugar,
 * blood pressure, oxygen saturation, heart rate) or a general advice block.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarePlan {

    /**
     * Overall urgency message shown at the top of the plan.
     * Examples:
     *  "⚠️ Your vitals are in a HIGH-risk zone — please consult a doctor."
     *  "✅ Your vitals look good — keep up the healthy routine!"
     */
    private String headline;

    /**
     * Whether the patient should immediately contact a doctor.
     * Set to {@code true} for HIGH risk.
     */
    private boolean callDoctorNow;

    /**
     * Ordered list of recommendation sections.
     */
    private List<Section> sections;

    // ── Inner section ─────────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Section {

        /** Section emoji + title, e.g. "🩸 Blood Sugar Plan" */
        private String title;

        /** Short clinical context, e.g. "(Hyperglycemia — avg 178 mg/dL)" */
        private String subtitle;

        /** Ordered, human-readable action items for this section. */
        private List<String> tips;

        /** Warning signs the patient should watch for. */
        private List<String> warningSigns;
    }
}
