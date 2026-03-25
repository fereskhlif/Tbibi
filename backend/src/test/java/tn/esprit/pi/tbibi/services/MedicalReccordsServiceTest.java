package tn.esprit.pi.tbibi.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.pi.tbibi.DTO.*;
import tn.esprit.pi.tbibi.entities.*;
import tn.esprit.pi.tbibi.repositories.ActeRepo;
import tn.esprit.pi.tbibi.repositories.MedicalReccordsRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MedicalReccordsServiceTest {

    @Mock
    private MedicalReccordsRepo repository;

    @Mock
    private UserRepo userRepo;

    @Mock
    private ActeRepo acteRepo;

    @Mock
    private MedRec_Mapper mapper;

    @Mock
    private Acte_Mapper acteMapper;

    @InjectMocks
    private MedicalRec medicalService;

    // --- DOCTOR TESTS ---

    @Test
    void addActe_ShouldAppendActeToRecordSuccessfully() {

        int recordId = 1;
        ActeRequest request = new ActeRequest();
        
        MedicalReccords record = new MedicalReccords();
        record.setMedicalfile_id(recordId);
        record.setActes(new ArrayList<>());

        Acte acteEnt = new Acte();
        acteEnt.setActeId(10);

        when(repository.findById(recordId)).thenReturn(Optional.of(record));
        when(acteMapper.toEntity(request)).thenReturn(acteEnt);
        when(acteRepo.save(any(Acte.class))).thenReturn(acteEnt);
        when(repository.save(any(MedicalReccords.class))).thenReturn(record);

        MdicalReccordsResponse responseDto = new MdicalReccordsResponse();
        responseDto.setMedicalfile_id(recordId);
        when(mapper.toResponse(record)).thenReturn(responseDto);

        // Act
        MdicalReccordsResponse result = medicalService.addActe(recordId, request);

        // Assert
        assertNotNull(result);
        assertEquals(recordId, result.getMedicalfile_id());
        assertTrue(record.getActes().contains(acteEnt));
        verify(repository, times(1)).save(record);
        verify(acteRepo, times(1)).save(acteEnt);
    }

}
