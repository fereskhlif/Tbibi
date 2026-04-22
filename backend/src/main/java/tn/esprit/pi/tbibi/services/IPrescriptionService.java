package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.PrescriptionRequest;
import tn.esprit.pi.tbibi.DTO.PrescriptionResponse;
import tn.esprit.pi.tbibi.entities.PrescriptionStatus;

import java.util.List;

public interface IPrescriptionService {
    PrescriptionResponse add(PrescriptionRequest prescription);
    PrescriptionResponse update(int id, PrescriptionRequest prescription);
    void delete(int id);
    PrescriptionResponse getById(int id);
    List<PrescriptionResponse> getAll();
    PrescriptionResponse updateStatus(int id, PrescriptionStatus status);
    PrescriptionResponse assignActe(int prescriptionId, int acteId);
    /** Returns only the prescriptions belonging to the currently authenticated patient. */
    List<PrescriptionResponse> getMyPrescriptions();

    /** Returns prescriptions linked to an acte of type "analyse" (for the laboratory). */
    List<PrescriptionResponse> getAnalysisPrescriptions();

    /** Patient requests a renewal of an existing prescription */
    PrescriptionResponse renewPrescription(int id);
}