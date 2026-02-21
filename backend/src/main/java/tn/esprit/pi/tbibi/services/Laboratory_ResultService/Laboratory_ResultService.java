package tn.esprit.pi.tbibi.services.Laboratory_ResultService;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultRequest;
import tn.esprit.pi.tbibi.DTO.dtoLaboratory_Result.Laboratory_ResultResponse;
import tn.esprit.pi.tbibi.entities.Laboratory_Result;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.mappers.Laboratory_ResultMapper;
import tn.esprit.pi.tbibi.repositories.Laboratory_ResultRepository;
import tn.esprit.pi.tbibi.repositories.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class Laboratory_ResultService implements ILaboratory_ResultService {

    private final Laboratory_ResultRepository labRepo;
    private final UserRepository userRepo;
    private final Laboratory_ResultMapper mapper;

    @Override
    public Laboratory_ResultResponse create(Laboratory_ResultRequest request) {
        User patient = userRepo.findById(request.getPatientId()).get();
        Laboratory_Result lab = mapper.toEntity(request);
        lab.setPatient(patient);
        return mapper.toResponse(labRepo.save(lab));
    }

    @Override
    public Laboratory_ResultResponse getById(Integer id) {
        Laboratory_Result lab = labRepo.findById(id).get();
        return mapper.toResponse(lab);
    }

    @Override
    public List<Laboratory_ResultResponse> getAll() {
        return labRepo.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<Laboratory_ResultResponse> getByPatient(Integer patientId) {
        return labRepo.findByPatient_UserId(patientId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Laboratory_ResultResponse update(Integer id, Laboratory_ResultRequest request) {
        Laboratory_Result lab = labRepo.findById(id).get();
        lab.setTestName(request.getTestName());
        lab.setLocation(request.getLocation());
        lab.setNameLabo(request.getNameLabo());
        lab.setResultValue(request.getResultValue());
        lab.setStatus(request.getStatus());
        lab.setTestDate(request.getTestDate());
        return mapper.toResponse(labRepo.save(lab));
    }

    @Override
    public void delete(Integer id) {
        labRepo.deleteById(id);
    }
}