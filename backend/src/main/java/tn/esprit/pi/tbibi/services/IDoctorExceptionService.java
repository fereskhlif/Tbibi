package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.DoctorExceptionRequest;
import tn.esprit.pi.tbibi.DTO.DoctorExceptionResponse;

import java.util.List;

public interface IDoctorExceptionService {

    DoctorExceptionResponse addException(DoctorExceptionRequest request);

    List<DoctorExceptionResponse> getExceptions(Integer doctorId);

    void deleteException(Long id);
}
