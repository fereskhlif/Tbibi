package tn.esprit.pi.tbibi.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.spring6.SpringTemplateEngine;
import tn.esprit.pi.tbibi.entities.EmailTemplateName;

import org.thymeleaf.context.Context;
import java.util.HashMap;
import java.util.Map;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.springframework.mail.javamail.MimeMessageHelper.MULTIPART_MODE_MIXED;


@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    /** Expose sender for controllers that need to send custom inline HTML emails */
    public JavaMailSender getMailSender() { return mailSender; }
    @Async
    public void sendEmail(
            String to,
            String username,
            EmailTemplateName emailTemplate,
            String confirmationUrl,
            String activationCoder,
            String subject
    )throws MessagingException{

        String templateName;
        if(emailTemplate == null){
            templateName = "confirme-email";
        } else {
            templateName = emailTemplate.name();
        }
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(
                mimeMessage,
                MULTIPART_MODE_MIXED,
                UTF_8.name()
        );
        Map<String,Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("activation_code", activationCoder);
        properties.put("confirmationUrl", confirmationUrl);

        Context context = new Context();
        context.setVariables(properties);

        helper.setFrom("firasabdeljaouad@gmail.com");
        helper.setTo(to);
        helper.setSubject(subject);

        String template = templateEngine.process(templateName,context);
        helper.setText(template,true);

        mailSender.send(mimeMessage);
    }

    /** Sends a 4-digit verification code to the patient's email */
    @Async
    public void sendVerificationCode(String to, String patientName, String code) throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MULTIPART_MODE_MIXED, UTF_8.name());
        helper.setFrom("firasabdeljaouad@gmail.com");
        helper.setTo(to);
        helper.setSubject("Votre code de vérification - Tbibi");
        String html = "<div style='font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px'>"
                + "<h2 style='color:#2563eb;margin-bottom:8px'>Tbibi &mdash; Code de vérification</h2>"
                + "<p style='color:#374151'>Bonjour <b>" + patientName + "</b>,</p>"
                + "<p style='color:#374151'>Votre code de vérification pour confirmer votre rendez-vous est :</p>"
                + "<div style='font-size:48px;font-weight:bold;letter-spacing:12px;color:#1e40af;text-align:center;padding:24px 0'>" + code + "</div>"
                + "<p style='color:#6b7280;font-size:13px'>Ce code est valable 10 minutes. Ne le partagez pas.</p>"
                + "<p style='color:#6b7280;font-size:13px'>Après confirmation, vous recevrez un email avec le lien unique de votre consultation.</p>"
                + "<hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0'/>"
                + "<p style='color:#9ca3af;font-size:12px'>Si vous n'avez pas demandé ce code, ignorez cet email.</p>"
                + "</div>";
        helper.setText(html, true);
        mailSender.send(mimeMessage);
    }

    /** Sends appointment confirmation email to the patient */
    @Async
    public void sendAppointmentConfirmation(
            String to,
            String patientName,
            String doctorName,
            String specialty,
            String date,
            String time,
            String location,
            String meetingLink) throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, MULTIPART_MODE_MIXED, UTF_8.name());
        Map<String, Object> properties = new HashMap<>();
        properties.put("patientName", patientName);
        properties.put("doctorName", doctorName);
        properties.put("specialty", specialty != null ? specialty : "");
        properties.put("date", date);
        properties.put("time", time);
        properties.put("location", location != null ? location : "");
        properties.put("meetingLink", meetingLink != null ? meetingLink : "");
        Context context = new Context();
        context.setVariables(properties);
        helper.setFrom("firasabdeljaouad@gmail.com");
        helper.setTo(to);
        helper.setSubject("Confirmation de votre rendez-vous - Tbibi");
        String html = templateEngine.process("appointment_confirmation", context);
        helper.setText(html, true);
        mailSender.send(mimeMessage);
    }

}
