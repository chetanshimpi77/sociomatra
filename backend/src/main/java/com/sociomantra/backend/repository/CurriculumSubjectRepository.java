package com.sociomantra.backend.repository;

import com.sociomantra.backend.entity.CurriculumSection;
import com.sociomantra.backend.entity.CurriculumSubject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CurriculumSubjectRepository extends JpaRepository<CurriculumSubject, Long> {
    List<CurriculumSubject> findByCourseIdAndSectionOrderByOrderIndexAsc(String courseId, CurriculumSection section);
    List<CurriculumSubject> findByCourseIdOrderByOrderIndexAsc(String courseId);
}
