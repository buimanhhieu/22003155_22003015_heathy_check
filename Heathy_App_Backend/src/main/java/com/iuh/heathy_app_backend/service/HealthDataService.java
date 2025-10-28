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
        final OffsetDateTime startOfDay = date != null ? date.atStartOfDay().atOffset(ZoneOffset.UTC) : null;
        final OffsetDateTime endOfDay = date != null ? date.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC) : null;
        final HealthMetricType finalMetricType = metricType;
        
        // TODO: Implement filtering logic based on date and metricType
        // For now, return all entries for the user
        return healthDataEntryRepository.findAll()
                .stream()
                .filter(entry -> entry.getUser().getId().equals(userId))
                .filter(entry -> finalMetricType == null || entry.getMetricType().equals(finalMetricType))
                .filter(entry -> {
                    if (startOfDay != null && endOfDay != null) {
                        return entry.getRecordedAt().isAfter(startOfDay) && entry.getRecordedAt().isBefore(endOfDay);
                    }
                    return true;
                })
                .sorted((e1, e2) -> e2.getRecordedAt().compareTo(e1.getRecordedAt()))
                .toList();
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
        
        final OffsetDateTime startOfWeek = weekAgo.atStartOfDay().atOffset(ZoneOffset.UTC);
        final OffsetDateTime endOfWeek = today.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);
        final HealthMetricType finalMetricType = metricType;
        
        return healthDataEntryRepository.findAll()
                .stream()
                .filter(entry -> entry.getUser().getId().equals(userId))
                .filter(entry -> finalMetricType == null || entry.getMetricType().equals(finalMetricType))
                .filter(entry -> entry.getRecordedAt().isAfter(startOfWeek) && entry.getRecordedAt().isBefore(endOfWeek))
                .sorted((e1, e2) -> e2.getRecordedAt().compareTo(e1.getRecordedAt()))
                .toList();
    }
}

