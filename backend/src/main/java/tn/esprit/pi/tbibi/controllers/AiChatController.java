package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.Pharmacy;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.AppointmentRepo;
import tn.esprit.pi.tbibi.repositories.PharmacyRepository;
import tn.esprit.pi.tbibi.repositories.ScheduleRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import tn.esprit.pi.tbibi.services.GemmaService;

import java.security.Principal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AiChatController — AI medical assistant with full platform context awareness.
 *
 * Before asking the AI, we inject:
 *   - All doctors with their specialty + real available slots
 *   - All pharmacies and labs registered in the app
 *   - The logged-in patient's upcoming appointments
 *
 * This ensures the AI ONLY refers to real doctors/facilities in the app
 * and can answer "Is Dr. X available?" or "Which cardiologist is free this week?"
 */
@Slf4j
@RestController
@RequestMapping("/api/ai-chat")
@CrossOrigin(origins = { "http://localhost:4200", "http://localhost:4201", "http://localhost:4202" })
@RequiredArgsConstructor
public class AiChatController {

    private final GemmaService gemmaService;
    private final UserRepo userRepo;
    private final AppointmentRepo appointmentRepo;
    private final PharmacyRepository pharmacyRepository;
    private final ScheduleRepo scheduleRepo;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("EEE dd MMM yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> ask(@RequestBody Map<String, String> body, Principal principal) {
        String question = body.getOrDefault("question", "").trim();

        if (question.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Question cannot be empty"));
        }

        StringBuilder ctx = new StringBuilder();

        // ══════════════════════════════════════════════════════
        // 1. DOCTORS + REAL-TIME AVAILABILITY
        // ══════════════════════════════════════════════════════
        List<User> doctors = userRepo.findAllDoctors();

        // Fetch all free slots from today, grouped by doctor ID
        List<Schedule> allFreeSlots = scheduleRepo.findAllAvailableFromToday(LocalDate.now());
        Map<Integer, List<Schedule>> slotsByDoctor = allFreeSlots.stream()
                .filter(s -> s.getDoctor() != null)
                .collect(Collectors.groupingBy(s -> s.getDoctor().getUserId()));

        ctx.append("=== DOCTORS REGISTERED IN TBIBI APP ===\n");
        ctx.append("(These are the ONLY doctors in the system. ONLY mention these doctors when asked.)\n\n");

        for (User d : doctors) {
            String specialty = (d.getSpecialty() != null && !d.getSpecialty().isBlank())
                    ? d.getSpecialty() : "General Medicine";

            ctx.append("Doctor: Dr. ").append(d.getName()).append("\n");
            ctx.append("  Specialty: ").append(specialty).append("\n");

            List<Schedule> slots = slotsByDoctor.getOrDefault(d.getUserId(), Collections.emptyList());
            if (slots.isEmpty()) {
                ctx.append("  Availability: No free slots currently available.\n");
            } else {
                // Show up to 5 upcoming slots to keep the prompt compact
                ctx.append("  Available slots:\n");
                slots.stream().limit(5).forEach(s -> {
                    String date = s.getDate().format(DATE_FMT);
                    String time = s.getStartTime() != null ? s.getStartTime().format(TIME_FMT) : "—";
                    ctx.append("    • ").append(date).append(" at ").append(time).append("\n");
                });
                if (slots.size() > 5) {
                    ctx.append("    (+ ").append(slots.size() - 5).append(" more slots available)\n");
                }
            }
            ctx.append("\n");
        }

        // ══════════════════════════════════════════════════════
        // 2. PHARMACIES
        // ══════════════════════════════════════════════════════
        List<Pharmacy> pharmacies = pharmacyRepository.findAll();
        if (!pharmacies.isEmpty()) {
            ctx.append("=== PHARMACIES IN TBIBI APP ===\n");
            for (Pharmacy p : pharmacies) {
                ctx.append("- ").append(p.getPharmacyName());
                if (p.getPharmacyAddress() != null && !p.getPharmacyAddress().isBlank()) {
                    ctx.append(" | Address: ").append(p.getPharmacyAddress());
                }
                ctx.append("\n");
            }
            ctx.append("\n");
        }

        // ══════════════════════════════════════════════════════
        // 3. LABORATORIES
        // ══════════════════════════════════════════════════════
        List<User> labs = userRepo.findAllUsersByRoleName("LABORATORY");
        if (!labs.isEmpty()) {
            ctx.append("=== LABORATORIES IN TBIBI APP ===\n");
            for (User lab : labs) {
                ctx.append("- ").append(lab.getName());
                if (lab.getAdresse() != null && !lab.getAdresse().isBlank()) {
                    ctx.append(" | Address: ").append(lab.getAdresse());
                }
                ctx.append("\n");
            }
            ctx.append("\n");
        }

        // ══════════════════════════════════════════════════════
        // 4. PATIENT'S OWN APPOINTMENTS (if logged in)
        // ══════════════════════════════════════════════════════
        if (principal != null) {
            Optional<User> userOpt = userRepo.findByEmail(principal.getName());
            if (userOpt.isPresent()) {
                User patient = userOpt.get();
                ctx.append("=== CURRENT PATIENT: ").append(patient.getName()).append(" ===\n");

                List<Appointment> apps = appointmentRepo.findByUserUserId(patient.getUserId());
                if (apps.isEmpty()) {
                    ctx.append("No upcoming appointments booked yet.\n");
                } else {
                    for (Appointment a : apps) {
                        String date = (a.getSchedule() != null && a.getSchedule().getDate() != null)
                                ? a.getSchedule().getDate().format(DATE_FMT) : "Date unknown";
                        String time = (a.getSchedule() != null && a.getSchedule().getStartTime() != null)
                                ? a.getSchedule().getStartTime().format(TIME_FMT) : "";
                        ctx.append("- Appointment with Dr. ").append(a.getDoctor())
                           .append(" on ").append(date).append(" ").append(time)
                           .append(" | Status: ").append(a.getStatusAppointement()).append("\n");
                    }
                }
                ctx.append("\n");
            }
        }

        // ══════════════════════════════════════════════════════
        // 5. BUILD FINAL PROMPT + SEND TO AI
        // ══════════════════════════════════════════════════════
        String platformData = ctx.toString();
        log.info("--- AI CONTEXT ---\n{}", platformData);

        String finalPrompt =
            "You are Tbibi AI, the assistant for the Tbibi healthcare platform.\n\n" +
            "STRICT RULES:\n" +
            "1. When the user asks about doctors, ONLY mention the doctors listed below.\n" +
            "2. When they ask about a specialty (e.g. cardiology), list the matching doctors from the list along with their available slots.\n" +
            "3. When they ask about pharmacies or labs, ONLY mention those listed below.\n" +
            "4. Do NOT invent doctors or facilities that are not in the list.\n" +
            "5. Always end with: ⚕️ For booking, please use the Tbibi app directly.\n\n" +
            "--- TBIBI PLATFORM DATA ---\n" +
            platformData +
            "--- END OF PLATFORM DATA ---\n\n" +
            "USER QUESTION: " + question;

        String answer = gemmaService.askMedical(finalPrompt);
        return ResponseEntity.ok(Map.of("answer", answer));
    }
}
