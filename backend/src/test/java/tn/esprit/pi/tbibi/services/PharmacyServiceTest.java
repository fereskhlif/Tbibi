package tn.esprit.pi.tbibi.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.pi.tbibi.DTO.pharmacy.PharmacyRequest;
import tn.esprit.pi.tbibi.DTO.pharmacy.PharmacyResponse;
import tn.esprit.pi.tbibi.entities.Pharmacy;
import tn.esprit.pi.tbibi.mappers.PharmacyMapper;
import tn.esprit.pi.tbibi.repositories.PharmacyRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PharmacyServiceTest {

    @Mock
    private PharmacyRepository pharmacyRepo;

    @Mock
    private PharmacyMapper pharmacyMapper;

    @InjectMocks
    private PharmacyService pharmacyService;

    private Pharmacy testPharmacy;
    private PharmacyRequest testRequest;
    private PharmacyResponse testResponse;

    @BeforeEach
    void setUp() {
        testPharmacy = Pharmacy.builder()
                .pharmacyId(1L)
                .pharmacyName("Test Pharmacy")
                .pharmacyAddress("123 Test St")
                .build();

        testRequest = PharmacyRequest.builder()
                .pharmacyName("Test Pharmacy")
                .pharmacyAddress("123 Test St")
                .build();

        testResponse = PharmacyResponse.builder()
                .pharmacyId(1L)
                .pharmacyName("Test Pharmacy")
                .pharmacyAddress("123 Test St")
                .build();
    }

    @Test
    void testCreatePharmacy_Success() {
        when(pharmacyMapper.toEntity(any(PharmacyRequest.class))).thenReturn(testPharmacy);
        when(pharmacyRepo.save(any(Pharmacy.class))).thenReturn(testPharmacy);
        when(pharmacyMapper.toDto(any(Pharmacy.class))).thenReturn(testResponse);

        PharmacyResponse result = pharmacyService.createPharmacy(testRequest);

        assertNotNull(result);
        assertEquals("Test Pharmacy", result.getPharmacyName());
        verify(pharmacyRepo, times(1)).save(any(Pharmacy.class));
    }

    @Test
    void testGetPharmacyById_Success() {
        when(pharmacyRepo.findById(1L)).thenReturn(Optional.of(testPharmacy));
        when(pharmacyMapper.toDto(testPharmacy)).thenReturn(testResponse);

        PharmacyResponse result = pharmacyService.getPharmacyById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getPharmacyId());
        verify(pharmacyRepo, times(1)).findById(1L);
    }

    @Test
    void testGetPharmacyById_NotFound() {
        when(pharmacyRepo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> pharmacyService.getPharmacyById(999L));
    }

    @Test
    void testGetAllPharmacies_Success() {
        List<Pharmacy> pharmacies = Arrays.asList(testPharmacy);
        when(pharmacyRepo.findAll()).thenReturn(pharmacies);
        when(pharmacyMapper.toDto(any(Pharmacy.class))).thenReturn(testResponse);

        List<PharmacyResponse> result = pharmacyService.getAllPharmacies();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(pharmacyRepo, times(1)).findAll();
    }

    @Test
    void testUpdatePharmacy_Success() {
        when(pharmacyRepo.findById(1L)).thenReturn(Optional.of(testPharmacy));
        when(pharmacyRepo.save(any(Pharmacy.class))).thenReturn(testPharmacy);
        when(pharmacyMapper.toDto(any(Pharmacy.class))).thenReturn(testResponse);

        PharmacyResponse result = pharmacyService.updatePharmacy(1L, testRequest);

        assertNotNull(result);
        assertEquals("Test Pharmacy", result.getPharmacyName());
        verify(pharmacyRepo, times(1)).save(any(Pharmacy.class));
    }

    @Test
    void testDeletePharmacy_Success() {
        doNothing().when(pharmacyRepo).deleteById(1L);

        pharmacyService.deletePharmacy(1L);

        verify(pharmacyRepo, times(1)).deleteById(1L);
    }
}
