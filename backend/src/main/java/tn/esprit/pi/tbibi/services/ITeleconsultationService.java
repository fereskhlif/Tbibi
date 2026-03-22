package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.TeleconsultationRequest;
import tn.esprit.pi.tbibi.DTO.TeleconsultationResponse;

import java.util.List;

public interface ITeleconsultationService {
    TeleconsultationResponse create(TeleconsultationRequest request);

    TeleconsultationResponse getById(Integer id);

    TeleconsultationResponse getByAppointmentId(Long appointmentId);

    List<TeleconsultationResponse> getAll();

    TeleconsultationResponse update(Integer id, TeleconsultationRequest request);

    void delete(Integer id);
}
