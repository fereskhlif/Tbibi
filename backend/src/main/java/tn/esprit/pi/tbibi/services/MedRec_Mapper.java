package tn.esprit.pi.tbibi.services;
<<<<<<< HEAD
=======

>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsRequest;
import tn.esprit.pi.tbibi.DTO.MdicalReccordsResponse;
import tn.esprit.pi.tbibi.entities.MedicalReccords;
<<<<<<< HEAD
@Mapper(componentModel = "spring", uses = {Prescription_Mapper.class, Acte_Mapper.class})
public interface MedRec_Mapper {

    @Mapping(target = "laboratoryResults", ignore = true)
    @Mapping(target = "actes",             ignore = true)
=======

@Mapper(componentModel = "spring", uses = {Acte_Mapper.class})
public interface MedRec_Mapper {

    @Mapping(target = "laboratoryResults", ignore = true)
    @Mapping(target = "actes", ignore = true)
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    MedicalReccords toEntity(MdicalReccordsRequest request);

    @Mapping(target = "actes", source = "actes")
    MdicalReccordsResponse toResponse(MedicalReccords entity);
}