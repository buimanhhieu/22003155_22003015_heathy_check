package com.iuh.heathy_app_backend.controller;

import com.iuh.heathy_app_backend.dto.HealthDataDTO;
import com.iuh.heathy_app_backend.dto.HealthDataResponseDTO;
import com.iuh.heathy_app_backend.entity.HealthDataEntry;
import com.iuh.heathy_app_backend.entity.HealthMetricType;
import com.iuh.heathy_app_backend.service.HealthDataService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users/{userId}/health-data")
public class HealthDataController {
    
    private final HealthDataService healthDataService;
    
    public HealthDataController(HealthDataService healthDataService) {
        this.healthDataService = healthDataService;
    }
    
    @PostMapping
    public ResponseEntity<HealthDataEntry> createHealthData(
            @PathVariable Long userId,
            @Valid @RequestBody HealthDataDTO healthDataDTO) {
        HealthDataEntry entry = healthDataService.createHealthData(userId, healthDataDTO);
        return ResponseEntity.ok(entry);
    }
    
    @GetMapping
    public ResponseEntity<List<HealthDataResponseDTO>> getHealthData(
            @PathVariable Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) HealthMetricType metricType) {
        System.out.println("[HealthDataController] GET /health-data - userId: " + userId + ", date: " + date + ", metricType: " + metricType);
        List<HealthDataEntry> entries = healthDataService.getHealthData(userId, date, metricType);
        System.out.println("[HealthDataController] Service returned " + entries.size() + " entries");
        List<HealthDataResponseDTO> responseDTOs = entries.stream()
                .map(entry -> new HealthDataResponseDTO(
                        entry.getId(),
                        entry.getMetricType(),
                        entry.getValue(),
                        entry.getUnit(),
                        entry.getRecordedAt()
                ))
                .collect(Collectors.toList());
        System.out.println("[HealthDataController] Returning " + responseDTOs.size() + " DTOs");
        return ResponseEntity.ok(responseDTOs);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<HealthDataEntry> updateHealthData(
            @PathVariable Long userId,
            @PathVariable Long id,
            @Valid @RequestBody HealthDataDTO healthDataDTO) {
        HealthDataEntry entry = healthDataService.updateHealthData(userId, id, healthDataDTO);
        return ResponseEntity.ok(entry);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHealthData(
            @PathVariable Long userId,
            @PathVariable Long id) {
        healthDataService.deleteHealthData(userId, id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/today")
    public ResponseEntity<List<HealthDataResponseDTO>> getTodayHealthData(
            @PathVariable Long userId) {
        List<HealthDataEntry> entries = healthDataService.getTodayHealthData(userId);
        List<HealthDataResponseDTO> responseDTOs = entries.stream()
                .map(entry -> new HealthDataResponseDTO(
                        entry.getId(),
                        entry.getMetricType(),
                        entry.getValue(),
                        entry.getUnit(),
                        entry.getRecordedAt()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }
    
    @GetMapping("/weekly")
    public ResponseEntity<List<HealthDataResponseDTO>> getWeeklyHealthData(
            @PathVariable Long userId,
            @RequestParam(required = false) HealthMetricType metricType) {
        List<HealthDataEntry> entries = healthDataService.getWeeklyHealthData(userId, metricType);
        List<HealthDataResponseDTO> responseDTOs = entries.stream()
                .map(entry -> new HealthDataResponseDTO(
                        entry.getId(),
                        entry.getMetricType(),
                        entry.getValue(),
                        entry.getUnit(),
                        entry.getRecordedAt()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }
}







