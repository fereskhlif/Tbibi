package tn.esprit.pi.tbibi.services;

import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.ActeRequest;
<<<<<<< HEAD
import tn.esprit.pi.tbibi.DTO.MdicalReccordsRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface IMedicalReccordsService {
    MdicalReccordsResponse add(MdicalReccordsRequest request, MultipartFile file) ;
    public MdicalReccordsResponse update(int id, MdicalReccordsRequest request);
    void delete(int id);
    MdicalReccordsResponse getById(int id);
    List<MdicalReccordsResponse> getAll();
    public MdicalReccordsResponse add(MdicalReccordsRequest request);
    public MdicalReccordsResponse addActe(int recordId, ActeRequest request);

}
=======
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
    MdicalReccordsResponse appendHistory(int medicalFileId, HistoryRequest request, String doctorEmail);

    // Patient self-service methods
    List<MdicalReccordsResponse> getMyRecord(String email);
    MdicalReccordsResponse uploadPatientImage(String email, MultipartFile file);
    MdicalReccordsResponse updateMyRecord(String email, MdicalReccordsRequest request);
    MdicalReccordsResponse addForPatient(String email, MdicalReccordsRequest request);
    void deletePatientImage(String email, String imagePath);
}

>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
