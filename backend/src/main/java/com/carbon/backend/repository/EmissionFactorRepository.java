package com.carbon.backend.repository;
import com.carbon.backend.model.EmissionFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, Long> {
    Optional<EmissionFactor> findByCategoryAndActivityTypeAndUnit(String category, String type, String unit);
}
