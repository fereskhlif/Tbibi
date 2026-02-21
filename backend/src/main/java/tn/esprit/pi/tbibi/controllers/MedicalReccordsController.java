package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsResponse;
import tn.esprit.pi.tbibi.services.MedicalRec;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/medical-records")
@RequiredArgsConstructor
public class MedicalReccordsController {

    private final MedicalRec service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MdicalReccordsResponse add(
            @RequestPart("data") MdicalReccordsRequest request,
            @RequestPart(value = "rep_doc", required = false) MultipartFile file) throws IOException {
        return service.add(request, file);
    }

    @GetMapping
    public List<MdicalReccordsResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public MdicalReccordsResponse getById(@PathVariable int id) {
        return service.getById(id);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MdicalReccordsResponse update(@PathVariable int id,@RequestPart("data") MdicalReccordsRequest request,@RequestPart(value = "rep_doc", required = false)MultipartFile file){
        return service.update(id, request, file);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}