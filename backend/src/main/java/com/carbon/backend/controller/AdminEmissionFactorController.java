package com.carbon.backend.controller;

import com.carbon.backend.model.EmissionFactor;
import com.carbon.backend.repository.EmissionFactorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/emission-factors")
public class AdminEmissionFactorController {

    @Autowired
    private EmissionFactorRepository emissionFactorRepository;

    @GetMapping
    public ResponseEntity<List<EmissionFactor>> getAll() {
        return ResponseEntity.ok(emissionFactorRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<EmissionFactor> create(@RequestBody EmissionFactor factor) {
        return ResponseEntity.ok(emissionFactorRepository.save(factor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmissionFactor> update(@PathVariable Long id, @RequestBody EmissionFactor updatedFactor) {
        return emissionFactorRepository.findById(id).map(factor -> {
            factor.setCategory(updatedFactor.getCategory());
            factor.setActivityType(updatedFactor.getActivityType());
            factor.setUnit(updatedFactor.getUnit());
            factor.setKgCo2PerUnit(updatedFactor.getKgCo2PerUnit());
            return ResponseEntity.ok(emissionFactorRepository.save(factor));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return emissionFactorRepository.findById(id).map(factor -> {
            emissionFactorRepository.delete(factor);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
