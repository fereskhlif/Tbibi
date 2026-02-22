package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Role;

public interface RoleRepo extends JpaRepository<Role,Integer> {
Role findByRoleName(String roleName);
}
