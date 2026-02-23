package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.PrescriptionRequest;
import tn.esprit.pi.tbibi.DTO.PrescriptionResponse;

import java.util.List;

public interface IPrescriptionService {
    PrescriptionResponse add(PrescriptionRequest prescription);
    PrescriptionResponse update(int id, PrescriptionRequest prescription);
    void delete(int id);
    PrescriptionResponse getById(int id);
    List<PrescriptionResponse> getAll();
}