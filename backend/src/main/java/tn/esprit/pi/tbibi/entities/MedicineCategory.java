package tn.esprit.pi.tbibi.entities;

public enum MedicineCategory {

    // Respiratory
    COUGH_AND_COLD,          // cough, cold, runny nose
    RESPIRATORY,             // asthma, bronchitis, shortness of breath

    // Pain
    FEVER_AND_PAIN,          // fever, headache, general pain
    MUSCLE_AND_JOINT,        // back pain, arthritis, muscle aches

    // Infections
    ANTIBIOTIC,              // bacterial infections, strep throat
    ANTIVIRAL,               // flu, herpes, viral infections
    ANTIFUNGAL,              // fungal infections, candida, athlete's foot

    // Digestive
    DIGESTIVE,               // stomach pain, nausea, diarrhea, constipation

    // Skin
    SKIN,                    // rashes, eczema, acne, psoriasis
    WOUND_CARE,              // cuts, burns, antiseptics

    // Allergies & Eyes
    ALLERGY,                 // sneezing, hives, itchy eyes
    EYE_AND_EAR,             // eye drops, ear drops, infections

    // Chronic Diseases
    DIABETES,                // blood sugar, insulin related
    HYPERTENSION,            // high blood pressure
    CARDIAC,                 // heart related beyond blood pressure
    THYROID,                 // hypo/hyperthyroidism

    // Mental Health
    ANXIETY_AND_SLEEP,       // anxiety, insomnia, depression

    // Other
    URINARY,                 // UTI, kidney, bladder
    VITAMINS_AND_SUPPLEMENTS,// vitamins, minerals, supplements
    ORAL_AND_DENTAL,         // toothache, mouth ulcers, gum issues

    OTHER
}
