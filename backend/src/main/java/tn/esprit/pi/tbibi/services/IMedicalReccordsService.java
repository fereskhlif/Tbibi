package tn.esprit.pi.tbibi.services;

import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.ActeRequest;
import tn.esprit.pi.tbibi.DTO.HistoryRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsResponse;
import tn.esprit.pi.tbibi.DTO.PatientRecordDTO;
import java.util.List;

public interface IMedicalReccordsService {
    MdicalReccordsResponse add(MdicalReccordsRequest request, MultipartFile file);
    MdicalReccordsResponse update(int id, MdicalReccordsRequest request);
    void delete(int id);
    MdicalReccordsResponse getById(int id);
    List<MdicalReccordsResponse> getAll();
    MdicalReccordsResponse add(MdicalReccordsRequest request);
    MdicalReccordsResponse addActe(int recordId, ActeRequest request);
    List<PatientRecordDTO> searchPatientsByName(String name);
    MdicalReccordsResponse appendHistory(int medicalFileId, HistoryRequest request);

    // Patient self-service methods
    MdicalReccordsResponse getMyRecord(String email);
    MdicalReccordsResponse uploadPatientImage(String email, MultipartFile file);
    MdicalReccordsResponse updateMyRecord(String email, MdicalReccordsRequest request);
    void deletePatientImage(String email, String imagePath);
}

