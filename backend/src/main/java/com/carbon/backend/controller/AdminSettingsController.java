package com.carbon.backend.controller;

import com.carbon.backend.model.SystemSettings;
import com.carbon.backend.repository.SystemSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/settings")
public class AdminSettingsController {

    @Autowired
    private SystemSettingsRepository settingsRepository;

    @GetMapping
    public ResponseEntity<List<SystemSettings>> getAllSettings() {
        return ResponseEntity.ok(settingsRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<SystemSettings> saveSetting(@RequestBody SystemSettings setting) {
        Optional<SystemSettings> existing = settingsRepository.findBySettingKey(setting.getSettingKey());
        if (existing.isPresent()) {
            SystemSettings toUpdate = existing.get();
            toUpdate.setSettingValue(setting.getSettingValue());
            if (setting.getDescription() != null) {
                toUpdate.setDescription(setting.getDescription());
            }
            return ResponseEntity.ok(settingsRepository.save(toUpdate));
        }
        return ResponseEntity.ok(settingsRepository.save(setting));
    }
}
