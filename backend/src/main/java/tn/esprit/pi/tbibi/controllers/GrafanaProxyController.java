package tn.esprit.pi.tbibi.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/grafana-proxy")
@CrossOrigin(origins = "http://localhost:4200") // ✅ Autoriser Angular
public class GrafanaProxyController {

    @Value("${grafana.url:http://localhost:3000}")
    private String grafanaUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // 🔹 Proxy pour les panels Grafana (embedding iframe) - retourne du HTML
    @GetMapping(value = "/render/{dashboardUid}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<byte[]> renderPanel(
            @PathVariable String dashboardUid,
            @RequestParam String panelId,
            @RequestParam(required = false, defaultValue = "dark") String theme) {

        try {
            String url = UriComponentsBuilder.fromHttpUrl(grafanaUrl)
                    .path("/d-solo/" + dashboardUid)
                    .queryParam("panelId", panelId)
                    .queryParam("orgId", "1")
                    .queryParam("theme", theme)
                    .queryParam("kiosk", "")
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "text/html");

            ResponseEntity<byte[]> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), byte[].class);

            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .header("Cache-Control", "no-cache")
                    .body(response.getBody());

        } catch (Exception e) {
            // Retourner une page d'erreur HTML lisible dans l'iframe
            String errorHtml = "<html><body><h3>❌ Erreur de chargement du panel</h3><p>" +
                    e.getMessage() + "</p></body></html>";
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .contentType(MediaType.TEXT_HTML)
                    .body(errorHtml.getBytes());
        }
    }
    // 🔹 Proxy pour le dashboard complet (mode kiosk)
    @GetMapping(value = "/d/{dashboardUid}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<byte[]> renderFullDashboard(
            @PathVariable String dashboardUid,
            @RequestParam(required = false, defaultValue = "dark") String theme,
            @RequestParam(required = false, defaultValue = "now-1h") String from,
            @RequestParam(required = false, defaultValue = "now") String to) {

        try {
            String url = UriComponentsBuilder.fromHttpUrl(grafanaUrl)
                    .path("/d/" + dashboardUid)
                    .queryParam("orgId", "1")
                    .queryParam("theme", theme)
                    .queryParam("from", from)
                    .queryParam("to", to)
                    .queryParam("kiosk", "tv")  // Mode kiosk pour cacher les menus
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "text/html");

            ResponseEntity<byte[]> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), byte[].class);

            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .header("Cache-Control", "no-cache")
                    .body(response.getBody());

        } catch (Exception e) {
            String errorHtml = "<html><body><h3>❌ Erreur de chargement du dashboard</h3><p>" +
                    e.getMessage() + "</p></body></html>";
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .contentType(MediaType.TEXT_HTML)
                    .body(errorHtml.getBytes());
        }
    }
    // 🔹 Proxy pour les données Prometheus via Grafana API - retourne du JSON
    @GetMapping(value = "/query", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> queryPrometheus(
            @RequestParam String query) {

        try {
            String url = UriComponentsBuilder.fromHttpUrl(grafanaUrl)
                    .path("/api/datasources/proxy/1/api/v1/query")
                    .queryParam("query", query)
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/json");
            // Ajoutez auth si nécessaire : headers.setBasicAuth("admin", "password");

            ResponseEntity<Map> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);

            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(error);
        }
    }

    // 🔹 Endpoint de santé du proxy - retourne du JSON
    @GetMapping(value = "/health", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> result = new HashMap<>();
        result.put("status", "ok");
        result.put("grafana", grafanaUrl);
        return ResponseEntity.ok(result);
    }
}