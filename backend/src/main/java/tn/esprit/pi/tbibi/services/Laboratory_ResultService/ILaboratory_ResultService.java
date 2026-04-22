package tn.esprit.pi.tbibi.services.Laboratory_ResultService;

import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultRequest;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultResponse;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.PatientLabStatisticsDTO;

import java.util.List;

public interface ILaboratory_ResultService {

    Laboratory_ResultResponse create(Laboratory_ResultRequest request);
    Laboratory_ResultResponse getById(Integer id);
    List<Laboratory_ResultResponse> getAll();
    Laboratory_ResultResponse update(Integer id, Laboratory_ResultRequest request);
    void delete(Integer id);

    List<Laboratory_ResultResponse> getByStatus(String status);
    List<Laboratory_ResultResponse> getByLaboratoryUser(Integer userId);
    Laboratory_ResultResponse updateStatus(Integer id, String newStatus);

    List<Laboratory_ResultResponse> getByPatient(Integer patientId);
    List<Laboratory_ResultResponse> getByPrescribedByDoctor(Integer doctorId);
    List<Laboratory_ResultResponse> getByPriority(String priority);
    List<Laboratory_ResultResponse> getPendingRequests();
    List<Laboratory_ResultResponse> getUrgentRequests();

    byte[] generateReport(Integer id);
    
    List<PatientLabStatisticsDTO> getPatientStatistics(Integer labUserId);
    List<Laboratory_ResultResponse> getDetailedResultsByDateRange(String status, String startDate, String endDate);
}