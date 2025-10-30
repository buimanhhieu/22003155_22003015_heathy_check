package com.iuh.heathy_app_backend.service;

import com.iuh.heathy_app_backend.dto.HealthDataDTO;
import com.iuh.heathy_app_backend.entity.HealthDataEntry;
import com.iuh.heathy_app_backend.entity.HealthMetricType;
import com.iuh.heathy_app_backend.entity.User;
import com.iuh.heathy_app_backend.repository.HealthDataEntryRepository;
import com.iuh.heathy_app_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class HealthDataService {
    
    private final HealthDataEntryRepository healthDataEntryRepository;
    private final UserRepository userRepository;
    
    public HealthDataService(HealthDataEntryRepository healthDataEntryRepository, UserRepository userRepository) {
        this.healthDataEntryRepository = healthDataEntryRepository;
        this.userRepository = userRepository;
    }
    
    @Transactional
    public HealthDataEntry createHealthData(Long userId, HealthDataDTO healthDataDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        HealthDataEntry entry = new HealthDataEntry();
        entry.setUser(user);
        entry.setMetricType(healthDataDTO.getMetricType());
        entry.setValue(healthDataDTO.getValue());
        entry.setUnit(healthDataDTO.getUnit());
        
        if (healthDataDTO.getRecordedAt() != null) {
            entry.setRecordedAt(healthDataDTO.getRecordedAt());
        } else {
            entry.setRecordedAt(OffsetDateTime.now());
        }
        
        return healthDataEntryRepository.save(entry);
    }
    
    @Transactional(readOnly = true)
    public List<HealthDataEntry> getHealthData(Long userId, LocalDate date, HealthMetricType metricType) {
        final HealthMetricType finalMetricType = metricType;
        
        System.out.println("[HealthDataService] getHealthData called - userId: " + userId + ", date: " + date + ", metricType: " + metricType);
        
        List<HealthDataEntry> allEntries = healthDataEntryRepository.findAll();
        System.out.println("[HealthDataService] Total entries in DB: " + allEntries.size());
        
        List<HealthDataEntry> result = allEntries
                .stream()
                .filter(entry -> {
                    boolean matches = entry.getUser().getId().equals(userId);
                    if (!matches) return false;
                    System.out.println("[HealthDataService] Entry " + entry.getId() + " - userId match: " + matches + ", metricType: " + entry.getMetricType() + ", recordedAt: " + entry.getRecordedAt());
                    return true;
                })
                .filter(entry -> {
                    if (finalMetricType != null) {
                        boolean matches = entry.getMetricType().equals(finalMetricType);
                        if (!matches) return false;
                    }
                    return true;
                })
                .filter(entry -> {
                    if (date != null) {
                        // Compare dates by converting to LocalDate to avoid timezone issues
                        LocalDate entryDate = entry.getRecordedAt().toLocalDate();
                        boolean matches = entryDate.equals(date);
                        System.out.println("[HealthDataService] Entry " + entry.getId() + " - entryDate: " + entryDate + ", requestedDate: " + date + ", match: " + matches);
                        return matches;
                    }
                    return true;
                })
                .sorted((e1, e2) -> e2.getRecordedAt().compareTo(e1.getRecordedAt()))
                .toList();
        
        System.out.println("[HealthDataService] Returning " + result.size() + " entries");
        return result;
    }
    
    @Transactional
    public HealthDataEntry updateHealthData(Long userId, Long entryId, HealthDataDTO healthDataDTO) {
        HealthDataEntry entry = healthDataEntryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Health data entry not found with id: " + entryId));
        
        if (!entry.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to health data entry");
        }
        
        if (healthDataDTO.getMetricType() != null) {
            entry.setMetricType(healthDataDTO.getMetricType());
        }
        if (healthDataDTO.getValue() != null) {
            entry.setValue(healthDataDTO.getValue());
        }
        if (healthDataDTO.getUnit() != null) {
            entry.setUnit(healthDataDTO.getUnit());
        }
        if (healthDataDTO.getRecordedAt() != null) {
            entry.setRecordedAt(healthDataDTO.getRecordedAt());
        }
        
        return healthDataEntryRepository.save(entry);
    }
    
    @Transactional
    public void deleteHealthData(Long userId, Long entryId) {
        HealthDataEntry entry = healthDataEntryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Health data entry not found with id: " + entryId));
        
        if (!entry.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to health data entry");
        }
        
        healthDataEntryRepository.delete(entry);
    }
    
    @Transactional(readOnly = true)
    public List<HealthDataEntry> getTodayHealthData(Long userId) {
        LocalDate today = LocalDate.now();
        return getHealthData(userId, today, null);
    }
    
    @Transactional(readOnly = true)
    public List<HealthDataEntry> getWeeklyHealthData(Long userId, HealthMetricType metricType) {
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(6);
        final HealthMetricType finalMetricType = metricType;
        
        return healthDataEntryRepository.findAll()
                .stream()
                .filter(entry -> entry.getUser().getId().equals(userId))
                .filter(entry -> finalMetricType == null || entry.getMetricType().equals(finalMetricType))
                .filter(entry -> {
                    // Compare dates by converting to LocalDate to avoid timezone issues
                    LocalDate entryDate = entry.getRecordedAt().toLocalDate();
                    return !entryDate.isBefore(weekAgo) && !entryDate.isAfter(today);
                })
                .sorted((e1, e2) -> e2.getRecordedAt().compareTo(e1.getRecordedAt()))
                .toList();
    }
}

