package kg.mega.kindergarten.services;

import kg.mega.kindergarten.enums.RegisterRole;
import kg.mega.kindergarten.models.AppUser;
import kg.mega.kindergarten.models.dtos.RegistrationDto;

import java.util.List;

public interface AppUserService {
    AppUser register(RegistrationDto dto);

    AppUser changeRole(Long userId, RegisterRole role);

    List<AppUser> getAll();
    
    AppUser findByUsername(String username);
}
