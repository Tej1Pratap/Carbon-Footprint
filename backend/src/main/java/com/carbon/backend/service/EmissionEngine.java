package com.carbon.backend.service;
import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.EmissionFactor;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.EmissionFactorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmissionEngine {
    @Autowired private EmissionFactorRepository factorRepo;
    
    public double calculateEmissions(String category, String type, String unit, double quantity) {
        EmissionFactor factor = factorRepo.findByCategoryAndActivityTypeAndUnit(category, type, unit)
                .orElseGet(() -> createDefaultFactor(category, type, unit));
        return factor.getKgCo2PerUnit() * quantity;
    }

    private EmissionFactor createDefaultFactor(String category, String type, String unit) {
        EmissionFactor newFactor = new EmissionFactor();
        newFactor.setCategory(category);
        newFactor.setActivityType(type);
        newFactor.setUnit(unit);
        
        // Assign sensible defaults for new/unknown activities
        double defaultKgCo2 = 0.1; 
        if ("Transport".equalsIgnoreCase(category)) defaultKgCo2 = 0.15; // Average generic vehicle
        else if ("Electricity".equalsIgnoreCase(category)) defaultKgCo2 = 0.4; // Average grid
        else if ("Food".equalsIgnoreCase(category)) defaultKgCo2 = 2.0; // Average meal
        else if ("Shopping".equalsIgnoreCase(category)) defaultKgCo2 = 0.5; // Average retail

        newFactor.setKgCo2PerUnit(defaultKgCo2);
        return factorRepo.save(newFactor);
    }
}
