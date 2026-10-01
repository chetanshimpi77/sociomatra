package com.sociomantra.backend.service;

import com.sociomantra.backend.dto.course.CourseDtos.CourseRequest;
import com.sociomantra.backend.dto.course.CourseDtos.CourseResponse;
import com.sociomantra.backend.dto.course.CourseDtos.CurriculumResponse;
import com.sociomantra.backend.dto.course.CourseDtos.CurriculumSectionResponse;
import com.sociomantra.backend.dto.course.CourseDtos.CurriculumSubjectResponse;
import com.sociomantra.backend.entity.Course;
import com.sociomantra.backend.entity.CurriculumSection;
import com.sociomantra.backend.entity.CurriculumSubject;
import com.sociomantra.backend.exception.ResourceNotFoundException;
import com.sociomantra.backend.repository.CourseRepository;
import com.sociomantra.backend.repository.CurriculumSubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final CurriculumSubjectRepository curriculumSubjectRepository;

    public List<CourseResponse> getAll() {
        return courseRepository.findAll().stream().map(CourseResponse::from).toList();
    }

    public CourseResponse getById(String id) {
        Course course = findCourseOrThrow(id);
        return CourseResponse.from(course);
    }

    @Transactional
    public CourseResponse create(CourseRequest request) {
        Course course = Course.builder()
                .id(request.getId())
                .name(request.getName())
                .tagline(request.getTagline())
                .duration(request.getDuration())
                .mode(request.getMode())
                .subjects(request.getSubjects())
                .hours(request.getHours())
                .description(request.getDescription())
                .color(request.getColor())
                .keyFeatures(joinFeatures(request))
                .build();

        return CourseResponse.from(courseRepository.save(course));
    }

    @Transactional
    public CourseResponse update(String id, CourseRequest request) {
        Course course = findCourseOrThrow(id);

        course.setName(request.getName());
        if (request.getTagline() != null) course.setTagline(request.getTagline());
        if (request.getDuration() != null) course.setDuration(request.getDuration());
        if (request.getMode() != null) course.setMode(request.getMode());
        if (request.getSubjects() != null) course.setSubjects(request.getSubjects());
        if (request.getHours() != null) course.setHours(request.getHours());
        if (request.getDescription() != null) course.setDescription(request.getDescription());
        if (request.getColor() != null) course.setColor(request.getColor());
        if (request.getKeyFeatures() != null) course.setKeyFeatures(joinFeatures(request));

        return CourseResponse.from(courseRepository.save(course));
    }

    @Transactional
    public void delete(String id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course not found with id " + id);
        }
        courseRepository.deleteById(id);
    }

    public CurriculumResponse getCurriculum(String courseId) {
        Course course = findCourseOrThrow(courseId);
        List<CurriculumSubject> all = curriculumSubjectRepository.findByCourseIdOrderByOrderIndexAsc(courseId);

        CurriculumResponse response = new CurriculumResponse();
        response.setCourseId(courseId);
        response.setKeyFeatures(CourseResponse.from(course).getKeyFeatures());
        response.setPrelims(buildSection(all, CurriculumSection.PRELIMS));
        response.setCsat(buildSection(all, CurriculumSection.CSAT));
        response.setMains(buildSection(all, CurriculumSection.MAINS));
        return response;
    }

    private CurriculumSectionResponse buildSection(List<CurriculumSubject> all, CurriculumSection section) {
        List<CurriculumSubject> matching = all.stream().filter(s -> s.getSection() == section).toList();
        if (matching.isEmpty()) return null;

        CurriculumSectionResponse response = new CurriculumSectionResponse();
        response.setTotalChapters(matching.get(0).getTotalChapters());
        response.setTotalHours(matching.get(0).getTotalHours());
        response.setSubjects(matching.stream().map(s -> {
            CurriculumSubjectResponse r = new CurriculumSubjectResponse();
            r.setId(s.getId());
            r.setName(s.getName());
            r.setOrderIndex(s.getOrderIndex());
            return r;
        }).toList());
        return response;
    }

    private Course findCourseOrThrow(String id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id " + id));
    }

    private String joinFeatures(CourseRequest request) {
        if (request.getKeyFeatures() == null) return null;
        return String.join(" | ", request.getKeyFeatures());
    }
}
