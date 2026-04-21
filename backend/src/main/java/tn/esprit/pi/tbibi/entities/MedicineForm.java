package tn.esprit.pi.tbibi.entities;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum MedicineForm {
    TABLET,
    CAPSULE,
    SYRUP,
    INJECTION,
    CREAM,
    OINTMENT,       // pommade
    SUPPOSITORY,
    EYE_DROPS,
    SPRAY,
    PATCH,
    SACHET,
    POWDER,       // poudre
    OTHER;

    @JsonCreator
    public static MedicineForm fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return MedicineForm.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return OTHER;
        }
    }
}
