package com.sociomantra.backend.config;

import com.sociomantra.backend.entity.*;
import com.sociomantra.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CurriculumSubjectRepository curriculumSubjectRepository;
    private final FacultyRepository facultyRepository;
    private final AcademySettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedCourses();
        seedFaculty();
        seedSettings();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail("admin@sociomantrias.com")) return;

        userRepository.save(User.builder()
                .name("Admin")
                .email("admin@sociomantrias.com")
                .phone("+91 98765 43210")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .build());
    }

    private void seedCourses() {
        if (courseRepository.count() > 0) return;

        Course foundation = courseRepository.save(Course.builder()
                .id("foundation")
                .name("UPSC CSE - Foundation Course")
                .tagline("Prelims + Mains")
                .duration("12 Months")
                .mode("Offline / Online")
                .subjects(15)
                .hours("360+")
                .description("A well-structured curriculum covering NCERTs, static subjects, current affairs, and answer writing practice to build a strong foundation for both Prelims and Mains.")
                .color("green")
                .keyFeatures("Concept-based learning | NCERT focus | Previous year questions (PYQs) | Regular mock tests | Topic-wise revision notes")
                .build());

        Course prelims = courseRepository.save(Course.builder()
                .id("prelims")
                .name("UPSC Prelims Focused Batch")
                .tagline("Prelims only")
                .duration("6 Months")
                .mode("Offline / Online")
                .subjects(9)
                .hours("160+")
                .description("Intensive preparation for UPSC Prelims with focused practice and full-length mock tests.")
                .color("purple")
                .keyFeatures("Prelims-only focus | Daily practice quizzes | Full-length mock tests | Topic-wise revision notes")
                .build());

        Course mains = courseRepository.save(Course.builder()
                .id("mains")
                .name("UPSC Mains Answer Writing Program")
                .tagline("Mains only")
                .duration("4 Months")
                .mode("Offline / Online")
                .subjects(9)
                .hours("200+")
                .description("Improve answer writing skills with expert evaluation and structured feedback for all Mains papers.")
                .color("blue")
                .keyFeatures("Weekly answer writing practice | Expert evaluation & feedback | Model answer discussions")
                .build());

        Course optional = courseRepository.save(Course.builder()
                .id("optional")
                .name("Optional Subjects")
                .tagline("PWB (History / Geography)")
                .duration("5 Months")
                .mode("Offline / Online")
                .subjects(2)
                .hours("150+")
                .description("Specialised coaching for the optional subject of your choice with dedicated subject experts.")
                .color("gold")
                .keyFeatures("Subject-expert faculty | Previous year answer analysis | Optional test series")
                .build());

        Course currentAffairs = courseRepository.save(Course.builder()
                .id("current-affairs")
                .name("Current Affairs & Test Series")
                .tagline("Ongoing")
                .duration("Rolling")
                .mode("Online")
                .subjects(1)
                .hours("100+")
                .description("Stay updated with weekly current affairs and full-length test series with detailed analysis.")
                .color("navy")
                .keyFeatures("Weekly current affairs digest | Monthly compilation | Full-length test series")
                .build());

        Course interview = courseRepository.save(Course.builder()
                .id("interview")
                .name("Interview Guidance Program")
                .tagline("Personality Development")
                .duration("1 Month")
                .mode("Offline / Online")
                .subjects(1)
                .hours("40+")
                .description("Personalised mentoring for the final round with mock interviews and detailed feedback.")
                .color("red")
                .keyFeatures("Mock interview panels | Personality development | DAF-based questioning practice")
                .build());

        seedPrelimsSubjects(foundation.getId(), 15, "120+");
        seedCsatSubjects(foundation.getId(), 6, "40+");
        seedMainsSubjects(foundation.getId(), 9, "200+");

        seedPrelimsSubjects(prelims.getId(), 12, "110+");
        seedCsatSubjects(prelims.getId(), 6, "40+");

        seedMainsSubjects(mains.getId(), 9, "200+");

        curriculumSubjectRepository.saveAll(List.of(
                subject(optional.getId(), CurriculumSection.MAINS, "Optional Subject Paper I", 1, 2, "150+"),
                subject(optional.getId(), CurriculumSection.MAINS, "Optional Subject Paper II", 2, 2, "150+")
        ));

        curriculumSubjectRepository.saveAll(List.of(
                subject(currentAffairs.getId(), CurriculumSection.PRELIMS, "Weekly Current Affairs", 1, 10, "100+"),
                subject(currentAffairs.getId(), CurriculumSection.PRELIMS, "Monthly Compilation", 2, 10, "100+"),
                subject(currentAffairs.getId(), CurriculumSection.PRELIMS, "Prelims Test Series", 3, 10, "100+"),
                subject(currentAffairs.getId(), CurriculumSection.PRELIMS, "Mains Test Series", 4, 10, "100+")
        ));

        curriculumSubjectRepository.saveAll(List.of(
                subject(interview.getId(), CurriculumSection.MAINS, "Mock Interviews", 1, 1, "40+"),
                subject(interview.getId(), CurriculumSection.MAINS, "Group Discussions", 2, 1, "40+"),
                subject(interview.getId(), CurriculumSection.MAINS, "DAF Analysis", 3, 1, "40+"),
                subject(interview.getId(), CurriculumSection.MAINS, "Current Affairs Discussion", 4, 1, "40+")
        ));
    }

    private void seedPrelimsSubjects(String courseId, int chapters, String hours) {
        List<String> subjects = List.of(
                "History - Ancient, Medieval & Modern",
                "Geography - Physical, Indian & World",
                "Indian Polity & Constitution",
                "Economy - Basics & Current Developments",
                "Environment & Ecology",
                "Science & Technology",
                "Current Affairs (Last 1 Year)"
        );
        int order = 1;
        for (String s : subjects) {
            curriculumSubjectRepository.save(subject(courseId, CurriculumSection.PRELIMS, s, order++, chapters, hours));
        }
    }

    private void seedCsatSubjects(String courseId, int chapters, String hours) {
        curriculumSubjectRepository.save(subject(courseId, CurriculumSection.CSAT, "CSAT (Prelims)", 1, chapters, hours));
    }

    private void seedMainsSubjects(String courseId, int papers, String hours) {
        List<String> subjects = List.of(
                "Essay",
                "General Studies I - Heritage, History & Geography",
                "General Studies II - Governance, Polity & IR",
                "General Studies III - Economy, S&T, Environment, Security",
                "General Studies IV - Ethics, Integrity & Aptitude"
        );
        int order = 1;
        for (String s : subjects) {
            curriculumSubjectRepository.save(subject(courseId, CurriculumSection.MAINS, s, order++, papers, hours));
        }
    }

    private CurriculumSubject subject(String courseId, CurriculumSection section, String name, int order, int chapters, String hours) {
        Course ref = courseRepository.getReferenceById(courseId);
        return CurriculumSubject.builder()
                .course(ref)
                .section(section)
                .name(name)
                .orderIndex(order)
                .totalChapters(chapters)
                .totalHours(hours)
                .build();
    }

    private void seedFaculty() {
        if (facultyRepository.count() > 0) return;

        facultyRepository.saveAll(List.of(
                Faculty.builder()
                        .name("Dr. Rajesh Sharma")
                        .subject("History")
                        .experience("20+ Years Experience")
                        .qualification("Ph.D. in Ancient Indian History, Delhi University")
                        .bio("Dr. Sharma has been teaching History to UPSC aspirants for over two decades and has authored two reference books on Ancient and Medieval India.")
                        .subjectsTaught("Ancient History | Medieval History | Art & Culture")
                        .achievements("Authored 2 UPSC reference books | Mentored 500+ selections | Guest faculty at LBSNAA")
                        .build(),
                Faculty.builder()
                        .name("Ms. Pooja Singh")
                        .subject("Polity")
                        .experience("15+ Years Experience")
                        .qualification("LLM, Constitutional Law, National Law University")
                        .bio("Ms. Singh specialises in Indian Polity and Governance, known for simplifying the Constitution for first-time learners.")
                        .subjectsTaught("Indian Constitution | Governance | Public Administration")
                        .achievements("15+ years in UPSC coaching | Panelist on constitutional law webinars")
                        .build(),
                Faculty.builder()
                        .name("Amit Kumar")
                        .subject("Economy")
                        .experience("12+ Years Experience")
                        .qualification("M.A. Economics, Delhi School of Economics")
                        .bio("Amit brings real-world policy analysis into the classroom, connecting economic theory with current budget and policy debates.")
                        .subjectsTaught("Indian Economy | Budget & Fiscal Policy | International Economics")
                        .achievements("Former economic policy researcher | Regularly quoted in current affairs sessions")
                        .build(),
                Faculty.builder()
                        .name("Nisha Verma")
                        .subject("Geography")
                        .experience("10+ Years Experience")
                        .qualification("M.Sc. Geography, JNU")
                        .bio("Nisha is known for her map-based teaching style that makes Physical and Indian Geography easy to visualise and retain.")
                        .subjectsTaught("Physical Geography | Indian Geography | World Geography")
                        .achievements("Designed the academy's map-based revision program")
                        .build(),
                Faculty.builder()
                        .name("Sandeep Yadav")
                        .subject("Science & Tech")
                        .experience("9+ Years Experience")
                        .qualification("B.Tech, IIT Roorkee")
                        .bio("Sandeep translates complex science and technology developments into exam-oriented, easy-to-recall notes.")
                        .subjectsTaught("Science & Technology | Space & Defence | Emerging Tech")
                        .achievements("Curates the monthly Science & Tech current affairs digest")
                        .build(),
                Faculty.builder()
                        .name("Anjali Gupta")
                        .subject("English & Essay")
                        .experience("8+ Years Experience")
                        .qualification("M.A. English Literature, Delhi University")
                        .bio("Anjali focuses on Essay writing and language skills, helping students structure high-scoring Mains answers and essays.")
                        .subjectsTaught("Essay Writing | Answer Writing | Ethics Case Studies")
                        .achievements("Evaluated 5000+ Mains answer sheets | Runs the weekly essay writing club")
                        .build()
        ));
    }

    private void seedSettings() {
        if (settingsRepository.count() > 0) return;

        settingsRepository.save(AcademySettings.builder()
                .id(1L)
                .academyName("SocioMantra IAS Academy")
                .phone("+91 98765 43210")
                .email("info@sociomantrias.com")
                .address("MukharjeeNagar, Delhi")
                .seoTitle("SocioMantra IAS Academy | Learn. Think. Succeed.")
                .seoDescription("SocioMantra IAS Academy - Guiding aspirants, building future bureaucrats. UPSC CSE coaching for Prelims, Mains and Interview.")
                .heroHeadline("Your Dream. Our Mission.")
                .heroSubheadline("Crack UPSC with the right guidance, strategy & support.")
                .build());
    }
}
