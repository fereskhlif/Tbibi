package tn.esprit.pi.tbibi.services;

import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface IMedicalReccordsService {
    MdicalReccordsResponse add(MdicalReccordsRequest request, MultipartFile file) ;
    MdicalReccordsResponse update(int id, MdicalReccordsRequest request, MultipartFile file) ;
    void delete(int id);
    MdicalReccordsResponse getById(int id);
    List<MdicalReccordsResponse> getAll();
}
