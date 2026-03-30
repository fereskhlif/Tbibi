import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface GrafanaPanel {
  id: number;
  title: string;
  icon: string;
  colSpan: string;
  height: string;
}

@Component({
  selector: 'app-admin-monitoring',
  template: `
  <div class="monitoring-page">

    <!-- Header -->
    <div class="monitoring-header">
      <div class="header-left">
        <div class="header-icon">📊</div>
        <div>
          <h1>Monitoring Système</h1>
          <p>Métriques temps réel — Tbibi Infrastructure</p>
        </div>
      </div>
      <div class="header-right">
        <span class="status-badge" [class.online]="grafanaOnline" [class.offline]="!grafanaOnline">
          <span class="status-dot"></span>
          {{ grafanaOnline ? 'Grafana En ligne' : 'Grafana Hors ligne' }}
        </span>
        <a [href]="grafanaBaseUrl" target="_blank" class="btn-open-grafana">
          🔗 Ouvrir Grafana
        </a>
        <a [href]="prometheusUrl" target="_blank" class="btn-open-prometheus">
          🔍 Prometheus
        </a>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-nav">
      <button
        class="tab-btn"
        [class.active]="activeTab === 'backend'"
        (click)="activeTab = 'backend'">
        🖥️ Backend Spring Boot
      </button>
      <button
        class="tab-btn"
        [class.active]="activeTab === 'system'"
        (click)="activeTab = 'system'">
        🐧 Système Linux
      </button>
      <button
        class="tab-btn"
        [class.active]="activeTab === 'full'"
        (click)="activeTab = 'full'">
        📺 Vue Complète
      </button>
    </div>

    <!-- Grafana Offline Warning -->
    <div class="grafana-offline" *ngIf="!grafanaOnline">
      <div class="offline-content">
        <span class="offline-icon">⚠️</span>
        <div>
          <strong>Grafana n'est pas accessible</strong>
          <p>Assurez-vous que le stack de monitoring est démarré sur le serveur.</p>
          <code>docker compose -f docker-compose.monitoring.yml up -d</code>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════ -->
    <!-- TAB: BACKEND SPRING BOOT               -->
    <!-- ═══════════════════════════════════════ -->
    <div class="panels-grid" *ngIf="activeTab === 'backend' && grafanaOnline">

      <!-- Backend Status -->
      <div class="panel-card span-1">
        <div class="panel-header">
          <span class="panel-icon">💚</span>
          <span class="panel-title">Statut Backend</span>
        </div>
        <iframe
          [src]="getPanelUrl('tbibi-springboot', 1)"
          frameborder="0"
          class="grafana-frame"
          style="height: 120px;">
        </iframe>
      </div>

      <!-- HTTP Request Rate -->
      <div class="panel-card span-2">
        <div class="panel-header">
          <span class="panel-icon">📈</span>
          <span class="panel-title">Taux de Requêtes HTTP (req/s)</span>
        </div>
        <iframe
          [src]="getPanelUrl('tbibi-springboot', 2)"
          frameborder="0"
          class="grafana-frame"
          style="height: 260px;">
        </iframe>
      </div>

      <!-- JVM Memory -->
      <div class="panel-card span-2">
        <div class="panel-header">
          <span class="panel-icon">💾</span>
          <span class="panel-title">Mémoire JVM</span>
        </div>
        <iframe
          [src]="getPanelUrl('tbibi-springboot', 4)"
          frameborder="0"
          class="grafana-frame"
          style="height: 260px;">
        </iframe>
      </div>

      <!-- HTTP Response Time p99 -->
      <div class="panel-card span-2">
        <div class="panel-header">
          <span class="panel-icon">⏱️</span>
          <span class="panel-title">Temps de Réponse HTTP (p99)</span>
        </div>
        <iframe
          [src]="getPanelUrl('tbibi-springboot', 3)"
          frameborder="0"
          class="grafana-frame"
          style="height: 260px;">
        </iframe>
      </div>

      <!-- CPU Usage -->
      <div class="panel-card span-2">
        <div class="panel-header">
          <span class="panel-icon">🔥</span>
          <span class="panel-title">Usage CPU (Process &amp; Système)</span>
        </div>
        <iframe
          [src]="getPanelUrl('tbibi-springboot', 6)"
          frameborder="0"
          class="grafana-frame"
          style="height: 260px;">
        </iframe>
      </div>

      <!-- JVM Threads -->
      <div class="panel-card span-2">
        <div class="panel-header">
          <span class="panel-icon">🧵</span>
          <span class="panel-title">Threads JVM</span>
        </div>
        <iframe
          [src]="getPanelUrl('tbibi-springboot', 5)"
          frameborder="0"
          class="grafana-frame"
          style="height: 260px;">
        </iframe>
      </div>

      <!-- HikariCP DB Pool -->
      <div class="panel-card span-2">
        <div class="panel-header">
          <span class="panel-icon">🗄️</span>
          <span class="panel-title">Pool de Connexions DB (HikariCP)</span>
        </div>
        <iframe
          [src]="getPanelUrl('tbibi-springboot', 7)"
          frameborder="0"
          class="grafana-frame"
          style="height: 260px;">
        </iframe>
      </div>

    </div>

    <!-- ═══════════════════════════════════════ -->
    <!-- TAB: SYSTÈME LINUX                     -->
    <!-- ═══════════════════════════════════════ -->
    <div class="panels-grid" *ngIf="activeTab === 'system' && grafanaOnline">

      <!-- CPU % -->
      <div class="panel-card span-1">
        <div class="panel-header">
          <span class="panel-icon">🔥</span>
          <span class="panel-title">CPU %</span>
        </div>
        <iframe
          [src]="getPanelUrl('tbibi-system', 1)"
          frameborder="0"
          class="grafana-frame"
          style="height: 130px;">
        </iframe>
      </div>

      <!-- RAM % -->
      <div class="panel-card span-1">
        <div class="panel-header">
          <span class="panel-icon">💾</span>
          <span class="panel-title">RAM %</span>
        </div>
        <iframe
          [src]="getPanelUrl('tbibi-system', 2)"
          frameborder="0"
          class="grafana-frame"
          style="height: 130px;">
        </iframe>
      </div>

      <!-- Disk % -->
      <div class="panel-card span-1">
        <div class="panel-header">
          <span class="panel-icon">💿</span>
          <span class="panel-title">Disque %</span>
        </div>
        <iframe
          [src]="getPanelUrl('tbibi-system', 3)"
          frameborder="0"
          class="grafana-frame"
          style="height: 130px;">
        </iframe>
      </div>

      <!-- Uptime -->
      <div class="panel-card span-1">
        <div class="panel-header">
          <span class="panel-icon">⏰</span>
          <span class="panel-title">Uptime</span>
        </div>
        <iframe
          [src]="getPanelUrl('tbibi-system', 4)"
          frameborder="0"
          class="grafana-frame"
          style="height: 130px;">
        </iframe>
      </div>

      <!-- CPU Over Time -->
      <div class="panel-card span-2">
        <div class="panel-header">
          <span class="panel-icon">📈</span>
          <span class="panel-title">Évolution CPU</span>
        </div>
        <iframe
          [src]="getPanelUrl('tbibi-system', 5)"
          frameborder="0"
          class="grafana-frame"
          style="height: 280px;">
        </iframe>
      </div>

      <!-- Memory Over Time -->
      <div class="panel-card span-2">
        <div class="panel-header">
          <span class="panel-icon">📉</span>
          <span class="panel-title">Évolution Mémoire</span>
        </div>
        <iframe
          [src]="getPanelUrl('tbibi-system', 6)"
          frameborder="0"
          class="grafana-frame"
          style="height: 280px;">
        </iframe>
      </div>

      <!-- Network I/O -->
      <div class="panel-card span-2">
        <div class="panel-header">
          <span class="panel-icon">🌐</span>
          <span class="panel-title">Réseau I/O</span>
        </div>
        <iframe
          [src]="getPanelUrl('tbibi-system', 7)"
          frameborder="0"
          class="grafana-frame"
          style="height: 280px;">
        </iframe>
      </div>

      <!-- Disk I/O -->
      <div class="panel-card span-2">
        <div class="panel-header">
          <span class="panel-icon">💿</span>
          <span class="panel-title">Disque I/O</span>
        </div>
        <iframe
          [src]="getPanelUrl('tbibi-system', 8)"
          frameborder="0"
          class="grafana-frame"
          style="height: 280px;">
        </iframe>
      </div>

    </div>

    <!-- ═══════════════════════════════════════ -->
    <!-- TAB: VUE COMPLETE (Full Dashboard)     -->
    <!-- ═══════════════════════════════════════ -->
    <div class="full-dashboard" *ngIf="activeTab === 'full' && grafanaOnline">
      <div class="full-tabs">
        <button class="full-tab" [class.active]="fullView === 'backend'" (click)="fullView = 'backend'">
          Spring Boot
        </button>
        <button class="full-tab" [class.active]="fullView === 'system'" (click)="fullView = 'system'">
          Système Linux
        </button>
      </div>
      <iframe
        [src]="getFullDashboardUrl(fullView === 'backend' ? 'tbibi-springboot' : 'tbibi-system')"
        frameborder="0"
        class="full-frame">
      </iframe>
    </div>

  </div>
  `,
  styles: [`
    .monitoring-page {
      min-height: 100vh;
      background: #0f1117;
      padding: 24px;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      color: #e2e8f0;
    }

    /* ─── HEADER ─────────────────────────── */
    .monitoring-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      font-size: 2rem;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-left h1 {
      font-size: 1.5rem;
      font-weight: 800;
      color: #f1f5f9;
      margin: 0;
      letter-spacing: -0.5px;
    }

    .header-left p {
      font-size: 0.85rem;
      color: #64748b;
      margin: 4px 0 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 50px;
      font-size: 0.82rem;
      font-weight: 600;
      border: 1px solid;
    }

    .status-badge.online {
      background: rgba(34, 197, 94, 0.1);
      border-color: rgba(34, 197, 94, 0.3);
      color: #22c55e;
    }

    .status-badge.offline {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .btn-open-grafana {
      padding: 8px 18px;
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      text-decoration: none;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 600;
      transition: opacity 0.2s;
    }

    .btn-open-grafana:hover { opacity: 0.85; }

    .btn-open-prometheus {
      padding: 8px 18px;
      background: #1e293b;
      border: 1px solid #334155;
      color: #94a3b8;
      text-decoration: none;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-open-prometheus:hover {
      background: #334155;
      color: #e2e8f0;
    }

    /* ─── TABS ────────────────────────────── */
    .tab-nav {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      background: #1e293b;
      padding: 6px;
      border-radius: 14px;
      width: fit-content;
    }

    .tab-btn {
      padding: 10px 22px;
      border: none;
      background: transparent;
      color: #64748b;
      font-size: 0.88rem;
      font-weight: 600;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-btn:hover { color: #e2e8f0; background: #334155; }

    .tab-btn.active {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    }

    /* ─── GRAFANA OFFLINE ─────────────────── */
    .grafana-offline {
      background: rgba(234, 88, 12, 0.1);
      border: 1px solid rgba(234, 88, 12, 0.3);
      border-radius: 14px;
      padding: 20px 24px;
      margin-bottom: 24px;
    }

    .offline-content {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .offline-icon { font-size: 2rem; }

    .offline-content strong {
      color: #fb923c;
      font-size: 1rem;
      display: block;
      margin-bottom: 4px;
    }

    .offline-content p {
      color: #94a3b8;
      font-size: 0.85rem;
      margin: 0 0 8px;
    }

    .offline-content code {
      background: #0f1117;
      border: 1px solid #334155;
      color: #22c55e;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      display: block;
    }

    /* ─── PANELS GRID ─────────────────────── */
    .panels-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .panel-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .panel-card:hover {
      border-color: #6366f1;
      box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2), 0 8px 24px rgba(0,0,0,0.3);
    }

    .span-1 { grid-column: span 1; }
    .span-2 { grid-column: span 2; }
    .span-4 { grid-column: span 4; }

    .panel-header {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #334155;
      background: #0f172a;
    }

    .panel-icon { font-size: 1rem; }

    .panel-title {
      font-size: 0.82rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .grafana-frame {
      width: 100%;
      border: none;
      display: block;
      background: #1e293b;
    }

    /* ─── FULL DASHBOARD ──────────────────── */
    .full-dashboard {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      overflow: hidden;
    }

    .full-tabs {
      display: flex;
      gap: 0;
      border-bottom: 1px solid #334155;
      background: #0f172a;
      padding: 8px 8px 0;
    }

    .full-tab {
      padding: 10px 22px;
      border: none;
      background: transparent;
      color: #64748b;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      transition: all 0.2s;
    }

    .full-tab.active {
      color: #6366f1;
      border-bottom-color: #6366f1;
    }

    .full-frame {
      width: 100%;
      height: 900px;
      border: none;
      display: block;
      background: #161b2e;
    }

    /* ─── RESPONSIVE ──────────────────────── */
    @media (max-width: 768px) {
      .panels-grid { grid-template-columns: 1fr; }
      .span-1, .span-2, .span-4 { grid-column: span 1; }
      .monitoring-header { flex-direction: column; align-items: flex-start; }
      .monitoring-page { padding: 16px; }
    }
  `]
})
export class AdminMonitoringComponent implements OnInit, OnDestroy {

  activeTab: 'backend' | 'system' | 'full' = 'backend';
  fullView: 'backend' | 'system' = 'backend';
  grafanaOnline = false;

  // Configuration pour utiliser la redirection de port (Port Forwarding) de VMware
  // Windows redirigera 'localhost' vers la machine Ubuntu automatiquement.
  readonly grafanaBaseUrl = 'http://localhost:3000';
  readonly prometheusUrl = 'http://localhost:9090';

  private timeRange = 'from=now-1h&to=now';
  private theme = 'theme=dark';
  private refreshInterval = 'refresh=30s';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.checkGrafanaStatus();
  }

  ngOnDestroy(): void {}

  checkGrafanaStatus(): void {
    // Tente de vérifier si Grafana répond
    fetch(`${this.grafanaBaseUrl}/api/health`, { mode: 'no-cors' })
      .then(() => { this.grafanaOnline = true; })
      .catch(() => { this.grafanaOnline = false; });

    // Optimistic: si on arrive à créer une URL, on suppose UP
    // L'utilisateur verra les iframes charger ou non
    this.grafanaOnline = true;
  }

  getPanelUrl(dashboardUid: string, panelId: number): SafeResourceUrl {
    const url = `${this.grafanaBaseUrl}/d-solo/${dashboardUid}/${dashboardUid}` +
      `?orgId=1&${this.timeRange}&${this.refreshInterval}&${this.theme}&panelId=${panelId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getFullDashboardUrl(dashboardUid: string): SafeResourceUrl {
    const url = `${this.grafanaBaseUrl}/d/${dashboardUid}/${dashboardUid}` +
      `?orgId=1&${this.timeRange}&${this.refreshInterval}&${this.theme}&kiosk=tv`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
