import os

base_dir = r"c:\Users\Admin\OneDrive\Desktop\Carbon Footprint\backend\src\test\java\com\carbon\backend"
os.makedirs(base_dir, exist_ok=True)

test_code = """package com.carbon.backend;

import com.carbon.backend.model.EmissionFactor;
import com.carbon.backend.repository.EmissionFactorRepository;
import com.carbon.backend.service.EmissionEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmissionEngineTest {
    @Mock private EmissionFactorRepository factorRepo;
    @InjectMocks private EmissionEngine emissionEngine;

    @BeforeEach
    void setUp() {
        EmissionFactor carFactor = new EmissionFactor();
        carFactor.setKgCo2PerUnit(0.192);
        lenient().when(factorRepo.findByCategoryAndActivityTypeAndUnit("Transport", "Car", "km")).thenReturn(Optional.of(carFactor));
        
        EmissionFactor foodFactor = new EmissionFactor();
        foodFactor.setKgCo2PerUnit(3.3);
        lenient().when(factorRepo.findByCategoryAndActivityTypeAndUnit("Food", "Meat Meal", "servings")).thenReturn(Optional.of(foodFactor));
    }

    @ParameterizedTest
    @CsvSource({
        "Transport, Car, km, 100, 19.2",
        "Transport, Car, km, 0, 0",
        "Food, Meat Meal, servings, 2, 6.6"
    })
    void testCalculateEmissions_Parameterized(String category, String type, String unit, double quantity, double expected) {
        double result = emissionEngine.calculateEmissions(category, type, unit, quantity);
        assertEquals(expected, result, 0.001);
    }

    @Test
    void testCalculateEmissions_UnknownFactorThrowsException() {
        when(factorRepo.findByCategoryAndActivityTypeAndUnit("Unknown", "Unknown", "Unknown")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> {
            emissionEngine.calculateEmissions("Unknown", "Unknown", "Unknown", 100);
        });
    }
}
"""
with open(os.path.join(base_dir, "EmissionEngineTest.java"), "w") as f:
    f.write(test_code)
print("Generated Tests")
