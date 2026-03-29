package tn.esprit.pi.tbibi.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineRequest;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineResponse;
import tn.esprit.pi.tbibi.entities.Medicine;
import tn.esprit.pi.tbibi.entities.Pharmacy;
import tn.esprit.pi.tbibi.mappers.MedicineMapper;
import tn.esprit.pi.tbibi.repositories.MedicineRepository;
import tn.esprit.pi.tbibi.repositories.PharmacyRepository;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicineServiceTest {

    @Mock
    private MedicineRepository medicineRepo;

    @Mock
    private MedicineMapper medicineMapper;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private PharmacyRepository pharmacyRepo;

    @InjectMocks
    private MedicineService medicineService;

    private Medicine testMedicine;
    private Pharmacy testPharmacy;
    private MedicineRequest testRequest;
    private MedicineResponse testResponse;

    @BeforeEach
    void setUp() {
        testPharmacy = Pharmacy.builder()
                .pharmacyId(1L)
                .pharmacyName("Test Pharmacy")
                .build();

        testMedicine = Medicine.builder()
                .medicineId(1L)
                .medicineName("Aspirin")
                .stock(100)
                .minStockAlert(20)
                .available(true)
                .pharmacy(testPharmacy)
                .imageUrls(new ArrayList<>())
                .build();

        testRequest = MedicineRequest.builder()
                .medicineName("Aspirin")
                .pharmacyId(1L)
                .stock(100)
                .minStockAlert(20)
                .build();

        testResponse = MedicineResponse.builder()
                .medicineId(1L)
                .medicineName("Aspirin")
                .pharmacyId(1L)
                .stock(100)
                .minStockAlert(20)
                .available(true)
                .build();
    }

    @Test
    void testCreateMedicine_Success() {
        MultipartFile mockFile = mock(MultipartFile.class);
        List<MultipartFile> images = Arrays.asList(mockFile);
        List<String> imageUrls = Arrays.asList("http://image.url");

        when(medicineMapper.toEntity(any(MedicineRequest.class))).thenReturn(testMedicine);
        when(pharmacyRepo.findById(1L)).thenReturn(Optional.of(testPharmacy));
        when(cloudinaryService.uploadImages(images)).thenReturn(imageUrls);
        when(medicineRepo.save(any(Medicine.class))).thenReturn(testMedicine);
        when(medicineMapper.toDto(any(Medicine.class))).thenReturn(testResponse);

        MedicineResponse result = medicineService.createMedicine(testRequest, images);

        assertNotNull(result);
        assertEquals("Aspirin", result.getMedicineName());
        verify(medicineRepo, times(1)).save(any(Medicine.class));
        verify(cloudinaryService, times(1)).uploadImages(images);
    }

    @Test
    void testGetMedicinesByPharmacy_Success() {
        when(medicineRepo.findByPharmacy_PharmacyIdAndAvailableTrue(1L)).thenReturn(Arrays.asList(testMedicine));
        when(medicineMapper.toDto(any(Medicine.class))).thenReturn(testResponse);

        List<MedicineResponse> result = medicineService.getMedicinesByPharmacy(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(medicineRepo, times(1)).findByPharmacy_PharmacyIdAndAvailableTrue(1L);
    }

    @Test
    void testGetAllMedicinesPaginated_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Medicine> page = new PageImpl<>(Arrays.asList(testMedicine));
        when(medicineRepo.findByAvailableTrue(pageable)).thenReturn(page);
        when(medicineMapper.toDto(any(Medicine.class))).thenReturn(testResponse);

        Page<MedicineResponse> result = medicineService.getAllMedicinesPaginated(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(medicineRepo, times(1)).findByAvailableTrue(pageable);
    }

    @Test
    void testAddImage_Success() {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(medicineRepo.findById(1L)).thenReturn(Optional.of(testMedicine));
        when(cloudinaryService.uploadImage(mockFile)).thenReturn("http://new-image.url");
        when(medicineRepo.save(any(Medicine.class))).thenReturn(testMedicine);
        when(medicineMapper.toDto(any(Medicine.class))).thenReturn(testResponse);

        MedicineResponse result = medicineService.addImage(1L, mockFile);

        assertNotNull(result);
        assertTrue(testMedicine.getImageUrls().contains("http://new-image.url"));
        verify(cloudinaryService, times(1)).uploadImage(mockFile);
    }

    @Test
    void testRemoveImage_Success() {
        testMedicine.getImageUrls().add("http://image-to-remove.url");
        when(medicineRepo.findById(1L)).thenReturn(Optional.of(testMedicine));
        doNothing().when(cloudinaryService).deleteImage("http://image-to-remove.url");
        when(medicineRepo.save(any(Medicine.class))).thenReturn(testMedicine);
        when(medicineMapper.toDto(any(Medicine.class))).thenReturn(testResponse);

        MedicineResponse result = medicineService.removeImage(1L, "http://image-to-remove.url");

        assertNotNull(result);
        assertFalse(testMedicine.getImageUrls().contains("http://image-to-remove.url"));
        verify(cloudinaryService, times(1)).deleteImage("http://image-to-remove.url");
    }

    @Test
    void testGetLowStockMedicines_Success() {
        testMedicine.setStock(10); // Low stock (min alert is 20)
        when(medicineRepo.findAll()).thenReturn(Arrays.asList(testMedicine));
        when(medicineMapper.toDto(any(Medicine.class))).thenReturn(testResponse);

        List<MedicineResponse> result = medicineService.getLowStockMedicines();

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void testGetExpiredMedicines_Success() {
        when(medicineRepo.findByDateOfExpirationBefore(any(Date.class))).thenReturn(Arrays.asList(testMedicine));
        when(medicineMapper.toDto(any(Medicine.class))).thenReturn(testResponse);

        List<MedicineResponse> result = medicineService.getExpiredMedicines();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(medicineRepo, times(1)).findByDateOfExpirationBefore(any(Date.class));
    }

    @Test
    void testDeleteMedicine_Success() {
        when(medicineRepo.findById(1L)).thenReturn(Optional.of(testMedicine));
        when(medicineRepo.save(any(Medicine.class))).thenReturn(testMedicine);

        medicineService.deleteMedicine(1L);

        assertFalse(testMedicine.isAvailable());
        verify(medicineRepo, times(1)).save(testMedicine);
    }
}
