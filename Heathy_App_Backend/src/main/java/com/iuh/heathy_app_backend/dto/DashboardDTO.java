package com.iuh.heathy_app_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class DashboardDTO {
    private HealthScoreDTO healthScore;
    private HighlightsDTO highlights;
    private WeeklyReportDTO weeklyReport;
    private List<BlogDTO> blogs;
}
