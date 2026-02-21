package tn.esprit.pi.tbibi.services.Laboratory_ResultService;

import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultRequest;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultResponse;
import java.util.List;

public interface ILaboratory_ResultService {

    Laboratory_ResultResponse create(Laboratory_ResultRequest request);
    Laboratory_ResultResponse getById(Integer id);
    List<Laboratory_ResultResponse> getAll();
    List<Laboratory_ResultResponse> getByPatient(Integer patientId);
    Laboratory_ResultResponse update(Integer id, Laboratory_ResultRequest request);
    void delete(Integer id);
}