package com.sociomantra.backend.service;

import com.sociomantra.backend.dto.course.CourseDtos.CourseResponse;
import com.sociomantra.backend.dto.course.CourseDtos.CurriculumResponse;
import com.sociomantra.backend.dto.course.CourseDtos.CurriculumSectionResponse;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class PdfService {

    private static final float MARGIN = 50;
    private static final float PAGE_WIDTH = PDRectangle.A4.getWidth();
    private static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();

    public byte[] generateCurriculumPdf(CourseResponse course, CurriculumResponse curriculum) {
        try (PDDocument document = new PDDocument()) {
            PdfWriter writer = new PdfWriter(document);

            writer.newPage();
            writer.title(course.getName());
            writer.subtitle(course.getTagline());
            writer.paragraph(course.getDescription());
            writer.spacer();

            writer.heading("Course Details");
            writer.keyValueRow("Duration", course.getDuration());
            writer.keyValueRow("Mode", course.getMode());
            writer.keyValueRow("Total Subjects", String.valueOf(course.getSubjects()));
            writer.keyValueRow("Total Hours", course.getHours());
            writer.spacer();

            if (course.getKeyFeatures() != null && !course.getKeyFeatures().isEmpty()) {
                writer.heading("Key Features");
                for (String feature : course.getKeyFeatures()) {
                    writer.bullet(feature);
                }
                writer.spacer();
            }

            writeSection(writer, "Prelims", curriculum.getPrelims());
            writeSection(writer, "CSAT", curriculum.getCsat());
            writeSection(writer, "Mains", curriculum.getMains());

            writer.close();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate curriculum PDF", e);
        }
    }

    private void writeSection(PdfWriter writer, String title, CurriculumSectionResponse section) throws IOException {
        if (section == null || section.getSubjects() == null || section.getSubjects().isEmpty()) return;

        writer.heading(title + " (Total Chapters: " + section.getTotalChapters() + " | Total Hours: " + section.getTotalHours() + ")");
        int i = 1;
        for (var subject : section.getSubjects()) {
            writer.bullet(i++ + ". " + subject.getName());
        }
        writer.spacer();
    }

    /**
     * Small stateful helper that keeps track of the current page/cursor
     * position so the caller can write a simple document top-to-bottom
     * without manually managing PDPageContentStream page breaks.
     */
    private static class PdfWriter {
        private final PDDocument document;
        private final PDFont regularFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        private final PDFont boldFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        private PDPageContentStream stream;
        private float cursorY;

        PdfWriter(PDDocument document) {
            this.document = document;
        }

        void newPage() throws IOException {
            if (stream != null) stream.close();
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            stream = new PDPageContentStream(document, page);
            cursorY = PAGE_HEIGHT - MARGIN;
        }

        void ensureSpace(float needed) throws IOException {
            if (cursorY - needed < MARGIN) {
                newPage();
            }
        }

        void title(String text) throws IOException {
            if (text == null) return;
            ensureSpace(28);
            write(text, boldFont, 20);
            cursorY -= 28;
        }

        void subtitle(String text) throws IOException {
            if (text == null || text.isBlank()) return;
            ensureSpace(18);
            write(text, regularFont, 12);
            cursorY -= 20;
        }

        void heading(String text) throws IOException {
            ensureSpace(22);
            write(text, boldFont, 13);
            cursorY -= 20;
        }

        void paragraph(String text) throws IOException {
            if (text == null || text.isBlank()) return;
            for (String line : wrap(text, regularFont, 11, PAGE_WIDTH - 2 * MARGIN)) {
                ensureSpace(16);
                write(line, regularFont, 11);
                cursorY -= 16;
            }
        }

        void bullet(String text) throws IOException {
            List<String> lines = wrap(text, regularFont, 11, PAGE_WIDTH - 2 * MARGIN - 14);
            boolean first = true;
            for (String line : lines) {
                ensureSpace(16);
                write((first ? "- " : "  ") + line, regularFont, 11);
                cursorY -= 16;
                first = false;
            }
        }

        void keyValueRow(String key, String value) throws IOException {
            ensureSpace(16);
            write(key + ": " + (value != null ? value : "-"), regularFont, 11);
            cursorY -= 16;
        }

        void spacer() {
            cursorY -= 10;
        }

        private void write(String text, PDFont font, float size) throws IOException {
            stream.beginText();
            stream.setFont(font, size);
            stream.newLineAtOffset(MARGIN, cursorY);
            stream.showText(sanitize(text));
            stream.endText();
        }

        private String sanitize(String text) {
            // Standard14 fonts only support WinAnsi encoding - strip anything outside it.
            StringBuilder sb = new StringBuilder();
            for (char c : text.toCharArray()) {
                sb.append(c < 256 ? c : '?');
            }
            return sb.toString();
        }

        private List<String> wrap(String text, PDFont font, float size, float maxWidth) throws IOException {
            List<String> lines = new java.util.ArrayList<>();
            for (String paragraph : text.split("\n")) {
                StringBuilder current = new StringBuilder();
                for (String word : paragraph.split(" ")) {
                    String candidate = current.isEmpty() ? word : current + " " + word;
                    float width = font.getStringWidth(sanitize(candidate)) / 1000 * size;
                    if (width > maxWidth && !current.isEmpty()) {
                        lines.add(current.toString());
                        current = new StringBuilder(word);
                    } else {
                        current = new StringBuilder(candidate);
                    }
                }
                if (!current.isEmpty()) lines.add(current.toString());
            }
            return lines;
        }

        void close() throws IOException {
            if (stream != null) stream.close();
        }
    }
}
