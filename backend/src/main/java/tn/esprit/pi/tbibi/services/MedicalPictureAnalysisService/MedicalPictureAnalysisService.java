package tn.esprit.pi.tbibi.services.MedicalPictureAnalysisService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.MedicalPictureAnalysisRequest;
import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.MedicalPictureAnalysisResponse;
import tn.esprit.pi.tbibi.entities.Laboratory_Result;
import tn.esprit.pi.tbibi.entities.MedicalPictureAnalysis;
import tn.esprit.pi.tbibi.mappers.MedicalPictureAnalysisMapper;
import tn.esprit.pi.tbibi.repositories.Laboratory_ResultRepository;
import tn.esprit.pi.tbibi.repositories.MedicalPictureAnalysisRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalPictureAnalysisService implements IMedicalPictureAnalysisService {

    private final MedicalPictureAnalysisRepository picRepo;
    private final Laboratory_ResultRepository labRepo;
    private final MedicalPictureAnalysisMapper mapper;

    @Override
    public MedicalPictureAnalysisResponse create(MedicalPictureAnalysisRequest request) {
        Laboratory_Result lab = labRepo.findById(request.getLaboratoryResultId()).get();
        MedicalPictureAnalysis pic = mapper.toEntity(request);
        pic.setLaboratoryResult(lab);
        return mapper.toResponse(picRepo.save(pic));
    }

    @Override
    public MedicalPictureAnalysisResponse getById(Integer id) {
        MedicalPictureAnalysis pic = picRepo.findById(id).get();
        return mapper.toResponse(pic);
    }

    @Override
    public List<MedicalPictureAnalysisResponse> getAll() {
        return picRepo.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MedicalPictureAnalysisResponse update(Integer id, MedicalPictureAnalysisRequest request) {
        MedicalPictureAnalysis pic = picRepo.findById(id).get();
        pic.setHistory(request.getHistory());
        return mapper.toResponse(picRepo.save(pic));
    }

    @Override
    public void delete(Integer id) {
        picRepo.deleteById(id);
    }
}