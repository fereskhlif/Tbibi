package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsResponse;
import tn.esprit.pi.tbibi.entities.MedicalReccords;
import tn.esprit.pi.tbibi.repositories.MedicalReccordsRepo;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RequiredArgsConstructor
@Service
public class MedicalRec implements IMedicalReccordsService {
    private final MedRec_Mapper mapper;
    private final MedicalReccordsRepo repository;
    private static final String UPLOAD_DIR = "uploads/";
//    @Override
//    public MdicalReccordsResponse add(MdicalReccordsRequest request) {
//        MedicalReccords entity = mapper.toEntity(request);
//        return mapper.toResponse(repository.save(entity));
//    }
private String saveFile(MultipartFile file) {
    try {
        Files.createDirectories(Paths.get(UPLOAD_DIR));
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path path = Paths.get(UPLOAD_DIR + fileName);
        Files.write(path, file.getBytes());
        return fileName;
    } catch (Exception e) {
        throw new RuntimeException("Erreur upload : " + e.getMessage());
    }
}
    @Override
    public MdicalReccordsResponse add(MdicalReccordsRequest request, MultipartFile file) {
        MedicalReccords entity = mapper.toEntity(request);
        if (file != null && !file.isEmpty()) {
            entity.setRep_doc(saveFile(file));
        }
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    public MdicalReccordsResponse add(MdicalReccordsRequest request) {
        MedicalReccords entity = mapper.toEntity(request);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    public MdicalReccordsResponse update(int id, MdicalReccordsRequest request) {
        MedicalReccords entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));
        entity.setImageLabo(request.getImageLabo());
        entity.setResult_ia(request.getResult_ia());
        entity.setMedical_historuy(request.getMedical_historuy());
        entity.setChronic_diseas(request.getChronic_diseas());
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    public void delete(int id) {

    }

    @Override
    public MdicalReccordsResponse getById(int id) {
        return null;
    }


    @Override
    public List<MdicalReccordsResponse> getAll() {
        List<MedicalReccords> entities = repository.findAll();
        List<MdicalReccordsResponse> responses = new java.util.ArrayList<>();
        for (MedicalReccords entity : entities) {
            responses.add(mapper.toResponse(entity));
        }
        return responses;
    }
}
