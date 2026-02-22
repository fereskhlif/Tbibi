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
@CrossOrigin(origins = "http://localhost:4200")
public class MedicalReccordsController {

    private final MedicalRec service;

    @PostMapping("/add")
    public MdicalReccordsResponse add(@RequestBody MdicalReccordsRequest request) {
        return service.add(request);
    }

    @GetMapping("/getAll")
    public List<MdicalReccordsResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public MdicalReccordsResponse getById(@PathVariable int id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public MdicalReccordsResponse update(@PathVariable int id, @RequestBody MdicalReccordsRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}