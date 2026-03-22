import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ActeDTO,
  PatientDTO,
  PrescriptionRequest,
  PrescriptionResponse,
  PrescriptionService,
  PrescriptionStatus,
  STATUS_META,
} from '../../../../services/prescription-service.service';
import { interval, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-doctor-prescriptions',
  styles: [`
    /* ═══════════════════════════════════════════════════
       IMPORTANT — ajouter dans index.html (une seule fois):
       <link rel="stylesheet"
         href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    ═══════════════════════════════════════════════════ */

    .page-shell {
      background: #f0f4f8;
      font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
    }

    /* ── Sticky title bar ─────────────────────────────
       position:sticky fonctionne par rapport au plus proche
       ancêtre avec overflow:auto/scroll. Si l'entête globale
       de l'app occupe une hauteur fixe, ajoutez
       top: <hauteur-header>px  ici.
    ────────────────────────────────────────────────── */
    .page-titlebar {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 2rem;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 20;
      box-shadow: 0 1px 6px rgba(0,0,0,0.06);
    }
    .page-titlebar h1 {
      font-size: 1rem;
      font-weight: 700;
      color: #1a2744;
      margin: 0;
      display: flex;
      align-items: center;
      gap: .45rem;
    }
    .page-titlebar .subtitle {
      font-size: .72rem;
      color: #64748b;
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: .35rem;
    }
    .pulse-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #22c55e;
      display: inline-block;
      animation: pulse 2s infinite;
      flex-shrink: 0;
    }
    @keyframes pulse {
      0%,100% { opacity:1; transform:scale(1); }
      50%      { opacity:.35; transform:scale(1.5); }
    }

    /* ── Content area ─────────────────────────────────── */
    .content-area {
      padding: 1.5rem 2rem 2rem;
      max-width: 1080px;
      margin: 0 auto;
    }

    /* ── Stat cards ───────────────────────────────────── */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4,1fr);
      gap: .875rem;
      margin-bottom: 1.25rem;
    }
    @media(max-width:768px){ .stat-grid{ grid-template-columns:repeat(2,1fr); } }

    .stat-card {
      background: #fff;
      border-radius: 14px;
      padding: 1rem 1.15rem;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all .2s;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      position: relative;
      overflow: hidden;
    }
    .stat-card::after {
      content:'';
      position:absolute;
      left:0; top:0;
      width:4px; height:100%;
      background: var(--sc,#3b82f6);
      opacity:0;
      transition:opacity .2s;
      border-radius:14px 0 0 14px;
    }
    .stat-card.active { border-color: var(--sc,#3b82f6); background: var(--sc-bg,#eff6ff); }
    .stat-card.active::after { opacity:1; }
    .stat-card:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(0,0,0,0.08); }
    .s-icon { font-size:1.4rem; color:var(--sc,#3b82f6); margin-bottom:.35rem; }
    .s-val  { font-size:1.7rem; font-weight:800; color:var(--sc,#3b82f6); line-height:1; }
    .s-lbl  { font-size:.68rem; font-weight:700; color:#64748b; margin-top:.3rem; text-transform:uppercase; letter-spacing:.05em; }

    /* ── Toolbar ──────────────────────────────────────── */
    .toolbar {
      display:flex; align-items:center;
      gap:.5rem; flex-wrap:wrap;
      margin-bottom:1.1rem;
    }
    .chip {
      padding:.3rem .8rem;
      border-radius:99px;
      font-size:.73rem; font-weight:600;
      border:1.5px solid #e2e8f0;
      background:#fff; color:#475569;
      cursor:pointer; transition:all .15s;
      display:flex; align-items:center; gap:.3rem;
      white-space:nowrap;
    }
    .chip:hover { border-color:#94a3b8; }
    .chip.all-active { background:#1a2744; color:#fff; border-color:#1a2744; }
    .sort-btn {
      padding:.3rem .85rem;
      border-radius:8px;
      font-size:.73rem; font-weight:600;
      border:1.5px solid #e2e8f0;
      background:#fff; color:#475569;
      cursor:pointer; transition:all .15s;
      display:flex; align-items:center; gap:.35rem;
    }
    .sort-btn:hover { border-color:#3b82f6; color:#3b82f6; }

    /* ── Primary button ───────────────────────────────── */
    .btn-primary {
      padding:.45rem 1.1rem;
      background:#2563eb; color:#fff;
      border-radius:9px;
      font-size:.8rem; font-weight:700;
      border:none; cursor:pointer;
      display:flex; align-items:center; gap:.4rem;
      transition:all .15s;
      box-shadow:0 2px 8px rgba(37,99,235,.28);
      white-space:nowrap;
    }
    .btn-primary:hover { background:#1d4ed8; transform:translateY(-1px); }

    /* ── Skeleton ─────────────────────────────────────── */
    .skel {
      background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
      background-size:200% 100%;
      animation:shimmer 1.4s infinite;
      border-radius:7px;
    }
    @keyframes shimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }

    /* ── Error / empty ────────────────────────────────── */
    .error-bar {
      background:#fef2f2; border:1px solid #fecaca;
      color:#dc2626; border-radius:10px;
      padding:.65rem 1rem; font-size:.8rem;
      margin-bottom:1rem;
      display:flex; align-items:center; gap:.5rem;
    }
    .empty-state {
      background:#fff;
      border:1.5px dashed #cbd5e1;
      border-radius:14px; padding:3rem; text-align:center;
    }
    .empty-state .e-icon { font-size:2.2rem; color:#94a3b8; margin-bottom:.75rem; }
    .empty-state p { color:#64748b; font-size:.88rem; font-weight:500; margin:0; }
    .empty-state small { color:#94a3b8; font-size:.76rem; }

    /* ── Prescription card ────────────────────────────── */
    .rx-card {
      background:#fff;
      border-radius:14px;
      border:1.5px solid #e8edf4;
      margin-bottom:.75rem;
      overflow:hidden;
      transition:box-shadow .2s, border-color .2s;
      animation:fadeUp .3s ease both;
    }
    @keyframes fadeUp{
      from{ opacity:0; transform:translateY(8px); }
      to  { opacity:1; transform:translateY(0);   }
    }
    .rx-card:hover { box-shadow:0 4px 18px rgba(0,0,0,0.08); border-color:#c7d7f0; }

    .rx-top {
      padding:1rem 1.1rem .75rem;
      display:flex; align-items:flex-start; gap:.85rem;
    }
    .rx-icon-wrap {
      width:42px; height:42px;
      border-radius:11px;
      display:flex; align-items:center; justify-content:center;
      font-size:1.15rem; flex-shrink:0;
    }
    .rx-id   { font-size:.84rem; font-weight:800; color:#1a2744; }
    .rx-note { font-size:.8rem; color:#64748b; margin:.2rem 0 .4rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:500px; }
    .rx-meta { display:flex; flex-wrap:wrap; gap:.55rem; font-size:.7rem; color:#94a3b8; }
    .m-item  { display:flex; align-items:center; gap:.25rem; }
    .m-item i{ font-size:.75rem; }

    /* Status badge — indigo replaces yellow for PENDING */
    .status-badge {
      display:inline-flex; align-items:center; gap:.3rem;
      padding:.18rem .65rem;
      border-radius:99px;
      font-size:.68rem; font-weight:700;
      border:1px solid transparent;
    }
    .badge-pending   { background:#eef2ff; color:#4f46e5; border-color:#c7d2fe; }
    .badge-validated { background:#ecfdf5; color:#059669; border-color:#a7f3d0; }
    .badge-dispensed { background:#eff6ff; color:#2563eb; border-color:#bfdbfe; }
    .badge-completed { background:#f0fdf4; color:#16a34a; border-color:#bbf7d0; }
    .badge-cancelled { background:#fef2f2; color:#dc2626; border-color:#fecaca; }

    .med-tag {
      display:inline-block;
      background:#eff6ff; color:#3b82f6;
      border:1px solid #bfdbfe;
      border-radius:99px;
      font-size:.66rem; font-weight:600;
      padding:.12rem .55rem;
    }

    /* ── Progress bar ─────────────────────────────────── */
    .prog-wrap  { padding:0 1.1rem .8rem; }
    .prog-track {
      position:relative; height:3px;
      background:#e2e8f0; border-radius:99px;
      margin:.4rem 0 .7rem;
    }
    .prog-fill {
      position:absolute; height:100%;
      border-radius:99px;
      background:linear-gradient(90deg,#6366f1,#2563eb);
      transition:width .5s ease;
    }
    .prog-dots {
      position:absolute; width:100%;
      top:50%; transform:translateY(-50%);
      display:flex; justify-content:space-between;
    }
    .prog-dot {
      width:20px; height:20px; border-radius:50%;
      border:2.5px solid #e2e8f0; background:#fff;
      display:flex; align-items:center; justify-content:center;
      font-size:.58rem; font-weight:700; color:#94a3b8;
      transition:all .3s; margin-top:-10px; z-index:1;
    }
    .prog-dot.done { background:#2563eb; border-color:#2563eb; color:#fff; }
    .prog-labels   { display:flex; justify-content:space-between; margin-top:1.4rem; }
    .prog-labels span { font-size:.65rem; font-weight:600; color:#94a3b8; flex:1; text-align:center; }
    .prog-labels span.done-lbl { color:#2563eb; }

    /* ── Cancelled banner ─────────────────────────────── */
    .cancelled-banner {
      margin:0 1.1rem .8rem;
      padding:.45rem .8rem;
      background:#fef2f2; border:1px solid #fecaca;
      border-radius:9px;
      color:#dc2626; font-size:.74rem; font-weight:600;
      display:flex; align-items:center; gap:.45rem;
    }

    /* ── Action bar — always visible ──────────────────── */
    .card-actions {
      border-top:1px solid #f1f5f9;
      background:#f8fafc;
      padding:.55rem 1.1rem;
      display:flex; flex-wrap:wrap; gap:.45rem;
    }
    .act-btn {
      display:inline-flex; align-items:center; gap:.35rem;
      padding:.32rem .8rem;
      border-radius:8px;
      font-size:.74rem; font-weight:600;
      border:1.5px solid transparent;
      cursor:pointer; transition:all .15s;
    }
    .act-btn i { font-size:.82rem; }
    .act-blue  { background:#eff6ff; color:#2563eb; border-color:#bfdbfe; }
    .act-blue:hover  { background:#2563eb; color:#fff; }
    .act-gray  { background:#fff; color:#475569; border-color:#e2e8f0; }
    .act-gray:hover  { background:#f1f5f9; border-color:#cbd5e1; }
    .act-green { background:#f0fdf4; color:#16a34a; border-color:#bbf7d0; }
    .act-green:hover { background:#16a34a; color:#fff; }
    .act-red   { background:#fff5f5; color:#dc2626; border-color:#fecaca; }
    .act-red:hover   { background:#dc2626; color:#fff; }

    .txt-green  { color:#16a34a; font-weight:600; font-size:.72rem; }
    .txt-orange { color:#ea580c; font-weight:600; font-size:.72rem; }

    /* ════════════════════════════════════════════════════
       MODALS
    ════════════════════════════════════════════════════ */
    .modal-overlay {
      position:fixed; inset:0;
      background:rgba(15,23,42,.45);
      display:flex; align-items:center; justify-content:center;
      z-index:50; padding:1rem;
      backdrop-filter:blur(3px);
      animation:fadeIn .15s ease;
    }
    @keyframes fadeIn{ from{opacity:0} to{opacity:1} }

    .modal-box {
      background:#fff; border-radius:18px;
      width:100%; max-width:480px; max-height:92vh;
      display:flex; flex-direction:column; overflow:hidden;
      box-shadow:0 20px 60px rgba(0,0,0,.18);
      animation:slideUp .2s ease;
    }
    .modal-box-lg { max-width:540px; }
    @keyframes slideUp{ from{transform:translateY(18px);opacity:0} to{transform:translateY(0);opacity:1} }

    .modal-head {
      padding:1.25rem 1.4rem 1.1rem;
      border-bottom:1px solid #f1f5f9;
      display:flex; justify-content:space-between; align-items:flex-start;
      flex-shrink:0;
    }
    .modal-head h2 { font-size:1rem; font-weight:800; color:#1a2744; margin:0; }
    .modal-head p  { font-size:.73rem; color:#64748b; margin:2px 0 0; }
    .modal-close {
      width:28px; height:28px; border-radius:7px;
      border:none; background:#f1f5f9; color:#64748b;
      font-size:.85rem; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:background .15s; flex-shrink:0;
    }
    .modal-close:hover { background:#e2e8f0; color:#1a2744; }

    .modal-body { padding:1.4rem; overflow-y:auto; flex:1; }
    .modal-foot {
      padding:.9rem 1.4rem;
      border-top:1px solid #f1f5f9; background:#f8fafc;
      display:flex; justify-content:flex-end; gap:.55rem;
      flex-shrink:0;
    }
    .modal-foot-between { justify-content:space-between; }

    .field { margin-bottom:1rem; }
    .field label {
      display:block; font-size:.68rem; font-weight:700;
      text-transform:uppercase; letter-spacing:.05em;
      color:#64748b; margin-bottom:.4rem;
    }
    .field input,.field select,.field textarea {
      width:100%; border:1.5px solid #e2e8f0;
      border-radius:10px; padding:.6rem .85rem;
      font-size:.83rem; color:#1a2744; background:#fff;
      outline:none; transition:border-color .15s, box-shadow .15s;
      font-family:inherit; box-sizing:border-box;
    }
    .field input:focus,.field select:focus,.field textarea:focus {
      border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.12);
    }
    .field textarea { resize:none; }

    .notice-block {
      background:#eff6ff; border:1px solid #bfdbfe;
      border-radius:12px; padding:.9rem 1rem; margin-bottom:1rem;
    }
    .notice-block > p { font-size:.76rem; color:#1e40af; font-weight:600; margin:0 0 .75rem; }

    .info-block {
      background:#f8fafc; border-radius:11px;
      padding:.85rem 1rem; margin-bottom:.9rem;
    }
    .ib-label { font-size:.66rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#94a3b8; margin-bottom:.25rem; }
    .ib-val   { font-size:.86rem; color:#1a2744; line-height:1.5; }

    .med-row {
      display:flex; align-items:center; justify-content:space-between;
      background:#fff; border:1.5px solid #e8edf4;
      border-radius:11px; padding:.6rem .85rem;
      margin-bottom:.45rem; transition:border-color .15s;
    }
    .med-row:hover { border-color:#bfdbfe; }
    .m-name { font-size:.83rem; font-weight:700; color:#1a2744; }
    .m-id   { font-size:.68rem; color:#94a3b8; margin-top:1px; }
    .qty-badge {
      background:#eff6ff; color:#2563eb;
      border:1px solid #bfdbfe; border-radius:99px;
      padding:.18rem .7rem; font-size:.76rem; font-weight:800;
    }

    .acte-list { max-height:260px; overflow-y:auto; padding-right:2px; }
    .acte-row {
      display:flex; align-items:center; gap:.7rem;
      padding:.7rem .85rem; border-radius:11px;
      border:1.5px solid #e2e8f0; cursor:pointer;
      transition:all .15s; margin-bottom:.45rem;
    }
    .acte-row:hover  { border-color:#93c5fd; background:#f8faff; }
    .acte-row.selected { border-color:#2563eb; background:#eff6ff; }
    .radio-dot {
      width:18px; height:18px; border-radius:50%;
      border:2px solid #cbd5e1; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
      transition:all .15s;
    }
    .acte-row.selected .radio-dot { border-color:#2563eb; background:#2563eb; }
    .radio-dot i { color:#fff; font-size:.6rem; }
    .acte-name { font-size:.82rem; font-weight:700; color:#1a2744; }
    .acte-desc { font-size:.7rem; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px; }
    .pat-pill      { flex-shrink:0; background:#f3e8ff; color:#7c3aed; font-size:.67rem; font-weight:700; padding:.18rem .6rem; border-radius:99px; }
    .pat-pill-gray { background:#f1f5f9; color:#94a3b8; }

    .btn-cancel {
      padding:.45rem 1rem; background:#fff;
      border:1.5px solid #e2e8f0; border-radius:9px;
      font-size:.8rem; font-weight:600; color:#475569;
      cursor:pointer; transition:all .15s;
      display:flex; align-items:center; gap:.35rem;
    }
    .btn-cancel:hover { background:#f1f5f9; }
    .btn-save {
      padding:.45rem 1.2rem; background:#2563eb;
      border:none; border-radius:9px;
      font-size:.8rem; font-weight:700; color:#fff;
      cursor:pointer; transition:all .15s;
      display:flex; align-items:center; gap:.35rem;
    }
    .btn-save:hover { background:#1d4ed8; }
    .btn-save:disabled { opacity:.5; cursor:not-allowed; }
    .btn-green-solid { background:#16a34a; }
    .btn-green-solid:hover { background:#15803d; }

    .section-label {
      font-size:.68rem; font-weight:700;
      text-transform:uppercase; letter-spacing:.06em;
      color:#94a3b8; margin-bottom:.6rem;
    }
  `],
  template: `
<div class="page-shell">

  <!-- ════ Sticky title bar ══════════════════════════════════════════════════ -->
  <div class="page-titlebar">
    <div>
      <h1><i class="bi bi-file-medical"></i> Mes Prescriptions</h1>
      <div class="subtitle">
        <span class="pulse-dot"></span>
        {{prescriptions.length}} prescription(s) &nbsp;·&nbsp; Actualisation toutes les 30 s
      </div>
    </div>
    <div style="display:flex;gap:.55rem;align-items:center">
      <button class="btn-primary" (click)="openAddModal()">
        <i class="bi bi-plus-lg"></i> Nouvelle prescription
      </button>
    </div>
  </div>

  <!-- ════ Content ═══════════════════════════════════════════════════════════ -->
  <div class="content-area">

    <!-- ── Stat cards ─────────────────────────────────────────────────────── -->
    <div class="stat-grid">
      <div *ngFor="let s of statusKeys.slice(0,4)"
        class="stat-card" [class.active]="activeFilter===s"
        [style.--sc]="STATUS_META[s].color"
        [style.--sc-bg]="STATUS_META[s].bg"
        [style.border-color]="activeFilter===s ? STATUS_META[s].color : 'transparent'"
        [style.background]="activeFilter===s ? STATUS_META[s].bg : '#fff'"
        (click)="activeFilter=(activeFilter===s ? 'ALL' : s)">
        <div class="s-icon"><i class="bi" [ngClass]="statIcon(s)"></i></div>
        <div class="s-val">{{countByStatus(s)}}</div>
        <div class="s-lbl">{{STATUS_META[s].label}}</div>
      </div>
    </div>

    <!-- ── Filter chips ────────────────────────────────────────────────────── -->
    <div class="toolbar">
      <button class="chip" [class.all-active]="activeFilter==='ALL'" (click)="activeFilter='ALL'">
        <i class="bi bi-grid-3x3-gap"></i> Toutes ({{prescriptions.length}})
      </button>
      <button *ngFor="let s of statusKeys" class="chip"
        [style.background]="activeFilter===s ? STATUS_META[s].color : '#fff'"
        [style.color]="activeFilter===s ? '#fff' : '#475569'"
        [style.border-color]="activeFilter===s ? STATUS_META[s].color : '#e2e8f0'"
        (click)="activeFilter=(activeFilter===s ? 'ALL' : s)">
        <i class="bi" [ngClass]="statIcon(s)"></i> {{STATUS_META[s].label}} ({{countByStatus(s)}})
      </button>
      <button class="sort-btn" style="margin-left:auto" (click)="sortDesc=!sortDesc">
        <i class="bi" [class.bi-sort-down]="sortDesc" [class.bi-sort-up]="!sortDesc"></i> Date
      </button>
    </div>

    <!-- ── Skeleton ────────────────────────────────────────────────────────── -->
    <div *ngIf="loading">
      <div *ngFor="let i of [1,2,3]"
        style="background:#fff;border-radius:14px;padding:1.1rem;margin-bottom:.75rem;border:1px solid #e2e8f0">
        <div style="display:flex;gap:.85rem">
          <div class="skel" style="width:42px;height:42px;border-radius:11px;flex-shrink:0"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:.45rem">
            <div class="skel" style="height:12px;width:35%"></div>
            <div class="skel" style="height:11px;width:55%"></div>
            <div class="skel" style="height:10px;width:22%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Error ───────────────────────────────────────────────────────────── -->
    <div *ngIf="error && !loading" class="error-bar">
      <i class="bi bi-exclamation-triangle-fill"></i> {{error}}
      <button (click)="loadAll(); error=''"
        style="margin-left:auto;background:none;border:none;color:inherit;cursor:pointer;font-size:.78rem;text-decoration:underline">
        Réessayer
      </button>
    </div>

    <!-- ── Empty state ─────────────────────────────────────────────────────── -->
    <div *ngIf="!loading && !error && filtered.length===0" class="empty-state">
      <div class="e-icon"><i class="bi bi-capsule"></i></div>
      <p>Aucune prescription trouvée</p>
      <small>{{ activeFilter==='ALL' ? 'Commencez par ajouter une prescription.' : 'Changez le filtre actif.' }}</small>
    </div>

    <!-- ── Cards ───────────────────────────────────────────────────────────── -->
    <div *ngIf="!loading">
      <div *ngFor="let rx of filtered; trackBy:trackById; let i=index"
        class="rx-card" [style.animation-delay]="(i*50)+'ms'">

        <!-- Top info row -->
        <div class="rx-top">
          <div class="rx-icon-wrap" [style.background]="statusBg(rx.status)">
            <i class="bi" [ngClass]="statIcon(rx.status)" [style.color]="statusColor(rx.status)"></i>
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:.4rem;margin-bottom:.15rem">
              <span class="rx-id">Prescription #{{rx.prescriptionID}}</span>
              <span class="status-badge" [ngClass]="statusBadgeClass(rx.status)">
                <i class="bi" [ngClass]="statIcon(rx.status)"></i>
                {{STATUS_META[rx.status]?.label}}
              </span>
            </div>
            <p class="rx-note">{{rx.note || '—'}}</p>
            <div class="rx-meta">
              <span class="m-item"><i class="bi bi-calendar3"></i> {{rx.date | date:'dd MMM yyyy'}}</span>
              <span class="m-item" *ngIf="rx.statusUpdatedAt">
                <i class="bi bi-arrow-repeat"></i> màj {{rx.statusUpdatedAt | date:'dd MMM, HH:mm'}}
              </span>
              <span class="m-item" *ngIf="rx.medicines?.length">
                <i class="bi bi-capsule"></i> {{rx.medicines.length}} médicament(s)
              </span>
              <span class="m-item txt-green" *ngIf="rx.patientName">
                <i class="bi bi-person-check-fill"></i> {{rx.patientName}}
              </span>
              <span class="m-item txt-orange" *ngIf="!rx.patientName">
                <i class="bi bi-person-dash"></i> Non affecté
              </span>
            </div>
            <div style="margin-top:.45rem;display:flex;flex-wrap:wrap;gap:.28rem" *ngIf="rx.medicines?.length">
              <span *ngFor="let m of rx.medicines.slice(0,4)" class="med-tag">{{m.medicineName}} ×{{m.quantity}}</span>
              <span *ngIf="rx.medicines.length>4" style="font-size:.68rem;color:#94a3b8;align-self:center">
                +{{rx.medicines.length-4}} autres
              </span>
            </div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="prog-wrap" *ngIf="rx.status!=='CANCELLED'">
          <div class="prog-track">
            <div class="prog-fill"
              [style.width]="(stepOf(rx.status)>=0 ? (stepOf(rx.status)/(STEPS.length-1))*100 : 0)+'%'">
            </div>
            <div class="prog-dots">
              <div *ngFor="let step of STEPS; let si=index"
                class="prog-dot" [class.done]="si<=stepOf(rx.status)"
                [title]="STATUS_META[step].label">
                <i *ngIf="si<=stepOf(rx.status)" class="bi bi-check" style="font-size:.65rem"></i>
                <span *ngIf="si>stepOf(rx.status)" style="font-size:.6rem">{{si+1}}</span>
              </div>
            </div>
          </div>
          <div class="prog-labels">
            <span *ngFor="let step of STEPS; let si=index" [class.done-lbl]="si<=stepOf(rx.status)">
              {{STATUS_META[step].label}}
            </span>
          </div>
        </div>

        <!-- Cancelled banner -->
        <div *ngIf="rx.status==='CANCELLED'" class="cancelled-banner">
          <i class="bi bi-x-circle-fill"></i> Cette prescription a été annulée
        </div>

        <!-- ── Action buttons — always visible ──────────────────────────── -->
        <div class="card-actions">
          <button class="act-btn act-blue"  (click)="openDetail(rx, $event)">
            <i class="bi bi-eye"></i> Détails
          </button>
          <button class="act-btn act-gray"  (click)="openEditModal(rx, $event)">
            <i class="bi bi-pencil"></i> Modifier
          </button>
          <button class="act-btn act-green" (click)="openAssignModal(rx, $event)">
            <i class="bi bi-person-plus"></i> Affecter à un acte
          </button>
          <button class="act-btn act-red"   (click)="deletePrescription(rx.prescriptionID, $event)">
            <i class="bi bi-trash3"></i> Supprimer
          </button>
        </div>
      </div>
    </div>

  </div><!-- /content-area -->


  <!-- ════ DETAIL MODAL ══════════════════════════════════════════════════════ -->
  <div *ngIf="showDetail && detailRx" class="modal-overlay" (click)="closeDetail()">
    <div class="modal-box modal-box-lg" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <div>
          <h2>Prescription #{{detailRx.prescriptionID}}</h2>
          <p>{{detailRx.date | date:'EEEE d MMMM yyyy'}}</p>
          <span *ngIf="detailRx.patientName" class="txt-green" style="font-size:.8rem">
            <i class="bi bi-person-check-fill"></i> {{detailRx.patientName}}
          </span>
          <span *ngIf="!detailRx.patientName" class="txt-orange" style="font-size:.8rem">
            <i class="bi bi-person-dash"></i> Non affecté
          </span>
        </div>
        <div style="display:flex;align-items:flex-start;gap:.6rem">
          <span class="status-badge" [ngClass]="statusBadgeClass(detailRx.status)">
            <i class="bi" [ngClass]="statIcon(detailRx.status)"></i>
            {{STATUS_META[detailRx.status]?.label}}
          </span>
          <button class="modal-close" (click)="closeDetail()"><i class="bi bi-x-lg"></i></button>
        </div>
      </div>
      <div class="modal-body">
        <p class="section-label">Suivi en temps réel</p>
        <div *ngIf="detailRx.status!=='CANCELLED'">
          <div class="prog-track" style="margin:.4rem 0 .7rem">
            <div class="prog-fill"
              [style.width]="(stepOf(detailRx.status)>=0 ? (stepOf(detailRx.status)/(STEPS.length-1))*100 : 0)+'%'">
            </div>
            <div class="prog-dots">
              <div *ngFor="let step of STEPS; let si=index"
                class="prog-dot" [class.done]="si<=stepOf(detailRx.status)"
                [title]="STATUS_META[step].label">
                <i *ngIf="si<=stepOf(detailRx.status)" class="bi bi-check" style="font-size:.65rem"></i>
                <span *ngIf="si>stepOf(detailRx.status)" style="font-size:.6rem">{{si+1}}</span>
              </div>
            </div>
          </div>
          <div class="prog-labels" style="margin-bottom:1rem">
            <span *ngFor="let step of STEPS; let si=index" [class.done-lbl]="si<=stepOf(detailRx.status)">
              {{STATUS_META[step].label}}
            </span>
          </div>
        </div>
        <div *ngIf="detailRx.status==='CANCELLED'" class="cancelled-banner" style="margin:0 0 1rem">
          <i class="bi bi-x-circle-fill"></i> Cette prescription a été annulée.
        </div>
        <p *ngIf="detailRx.statusUpdatedAt"
          style="font-size:.68rem;color:#94a3b8;text-align:right;margin-bottom:1rem">
          <i class="bi bi-clock-history"></i>
          Dernière màj : {{detailRx.statusUpdatedAt | date:'dd/MM/yyyy à HH:mm'}}
        </p>
        <div class="info-block">
          <div class="ib-label">Note du médecin</div>
          <div class="ib-val">{{detailRx.note || 'Aucune note.'}}</div>
        </div>
        <p class="section-label" *ngIf="detailRx.medicines?.length">
          Médicaments prescrits ({{detailRx.medicines.length}})
        </p>
        <div *ngFor="let m of detailRx.medicines" class="med-row">
          <div style="display:flex;align-items:center;gap:.7rem">
            <div style="width:34px;height:34px;background:#eff6ff;border-radius:10px;display:flex;align-items:center;justify-content:center">
              <i class="bi bi-capsule" style="color:#3b82f6;font-size:1rem"></i>
            </div>
            <div>
              <div class="m-name">{{m.medicineName}}</div>
              <div class="m-id">ID : {{m.medicineId}}</div>
            </div>
          </div>
          <span class="qty-badge">×{{m.quantity}}</span>
        </div>
        <div *ngIf="!detailRx.medicines?.length"
          style="text-align:center;padding:1.5rem;color:#94a3b8;font-size:.8rem">
          <i class="bi bi-inbox" style="font-size:1.4rem;display:block;margin-bottom:.4rem"></i>
          Aucun médicament associé.
        </div>
      </div>
      <div class="modal-foot modal-foot-between">
        <button class="btn-cancel" (click)="openEditModal(detailRx); closeDetail()">
          <i class="bi bi-pencil"></i> Modifier
        </button>
        <button class="btn-save" (click)="closeDetail()">Fermer</button>
      </div>
    </div>
  </div>


  <!-- ════ ASSIGN MODAL ══════════════════════════════════════════════════════ -->
  <div *ngIf="showAssignModal && assigningRx" class="modal-overlay" (click)="showAssignModal=false">
    <div class="modal-box" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <div>
          <h2><i class="bi bi-person-plus-fill"></i> Affecter à un patient</h2>
          <p>via sélection d'un acte médical</p>
        </div>
        <button class="modal-close" (click)="showAssignModal=false"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="modal-body">
        <div class="info-block" style="background:#eff6ff;border:1px solid #bfdbfe;margin-bottom:.9rem">
          <div class="ib-label" style="color:#3b82f6">Prescription</div>
          <div class="ib-val" style="color:#1e40af">#{{assigningRx.prescriptionID}} — {{assigningRx.note || 'Sans note'}}</div>
        </div>
        <div *ngIf="assigningRx.patientName"
          style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:.55rem .85rem;font-size:.78rem;color:#16a34a;font-weight:600;margin-bottom:.9rem;display:flex;align-items:center;gap:.4rem">
          <i class="bi bi-check-circle-fill"></i> Patient actuel : <strong>{{assigningRx.patientName}}</strong>
        </div>
        <div *ngIf="!assigningRx.patientName"
          style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:.55rem .85rem;font-size:.78rem;color:#ea580c;font-weight:600;margin-bottom:.9rem;display:flex;align-items:center;gap:.4rem">
          <i class="bi bi-exclamation-circle-fill"></i> Aucun patient assigné
        </div>
        <div class="field">
          <label><i class="bi bi-search"></i> Rechercher</label>
          <input type="text" [(ngModel)]="acteSearch" placeholder="Nom, type d'acte, ID..." />
        </div>
        <p class="section-label">Sélectionner un acte ({{filteredActes.length}} disponible(s))</p>
        <div *ngIf="filteredActes.length===0"
          style="text-align:center;padding:1.5rem;border:1.5px dashed #e2e8f0;border-radius:11px;color:#94a3b8;font-size:.8rem">
          <i class="bi bi-inbox" style="font-size:1.3rem;display:block;margin-bottom:.35rem"></i>
          Aucun acte trouvé
        </div>
        <div class="acte-list">
          <div *ngFor="let a of filteredActes"
            class="acte-row" [class.selected]="selectedActeId===a.acteId"
            (click)="selectedActeId=a.acteId">
            <div class="radio-dot"><i *ngIf="selectedActeId===a.acteId" class="bi bi-check"></i></div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:.35rem;flex-wrap:wrap">
                <span class="acte-name">Acte #{{a.acteId}}</span>
                <span *ngIf="a.typeOfActe"
                  style="background:#eff6ff;color:#3b82f6;font-size:.65rem;font-weight:700;padding:.12rem .5rem;border-radius:99px">
                  {{a.typeOfActe}}
                </span>
              </div>
              <p *ngIf="a.description" class="acte-desc">{{a.description}}</p>
            </div>
            <span class="pat-pill" [class.pat-pill-gray]="!a.patientName">
              {{a.patientName || 'Inconnu'}}
            </span>
          </div>
        </div>
        <div *ngIf="selectedActeId!==null"
          style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:.65rem .85rem;margin-top:.85rem;font-size:.8rem;color:#15803d;font-weight:600">
          <ng-container *ngFor="let a of actes">
            <span *ngIf="a.acteId===selectedActeId">
              <i class="bi bi-check-circle-fill"></i>
              Acte #{{a.acteId}} → <strong>{{a.patientName || 'Patient inconnu'}}</strong>
              <span *ngIf="a.typeOfActe"> ({{a.typeOfActe}})</span>
            </span>
          </ng-container>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn-cancel" (click)="showAssignModal=false"><i class="bi bi-x"></i> Annuler</button>
        <button class="btn-save btn-green-solid" (click)="saveAssign()" [disabled]="selectedActeId===null">
          <i class="bi bi-check-lg"></i> Confirmer
        </button>
      </div>
    </div>
  </div>


  <!-- ════ ADD / EDIT MODAL ══════════════════════════════════════════════════ -->
  <div *ngIf="showModal" class="modal-overlay" (click)="showModal=false">
    <div class="modal-box" (click)="$event.stopPropagation()">
      <div class="modal-head">
        <div>
          <h2>
            <i class="bi" [class.bi-pencil-square]="editMode" [class.bi-plus-circle-fill]="!editMode"></i>
            {{editMode ? 'Modifier la prescription' : 'Nouvelle prescription & Acte'}}
          </h2>
          <p>{{editMode ? 'Mise à jour de la note' : 'Un acte sera créé et lié automatiquement'}}</p>
        </div>
        <button class="modal-close" (click)="showModal=false"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="modal-body">
        <ng-container *ngIf="!editMode">
          <div class="notice-block">
            <p><i class="bi bi-info-circle-fill"></i> Un acte médical sera créé et lié automatiquement.</p>
            <div class="field">
              <label>Patient *</label>
              <select [(ngModel)]="form.patientId">
                <option [ngValue]="null" disabled>Sélectionner un patient...</option>
                <option *ngFor="let p of patients" [ngValue]="p.patientId">{{p.patientName}}</option>
              </select>
            </div>
            <div class="field">
              <label>Type d'acte *</label>
              <select [(ngModel)]="form.typeOfActe">
                <option value="PRESCRIPTION">Prescription</option>
                <option value="ANALYSIS">Analyse</option>
                <option value="DIAGNOSIS">Diagnostic</option>
              </select>
            </div>
            <div class="field" style="margin-bottom:0">
              <label>Description de l'acte *</label>
              <input type="text" [(ngModel)]="form.acteDescription" placeholder="Ex: Consultation médicale générale..." />
            </div>
          </div>
        </ng-container>
        <div class="field">
          <label>Note de prescription</label>
          <textarea [(ngModel)]="form.note" rows="3" placeholder="Détails de l'ordonnance, instructions..."></textarea>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn-cancel" (click)="showModal=false"><i class="bi bi-x"></i> Annuler</button>
        <button class="btn-save" (click)="save()" [disabled]="saving">
          <i class="bi" [class.bi-hourglass-split]="saving" [class.bi-check-lg]="!saving"></i>
          {{saving ? 'Sauvegarde...' : (editMode ? 'Enregistrer' : 'Créer Acte & Prescription')}}
        </button>
      </div>
    </div>
  </div>

</div>
`
})
export class DoctorPrescriptionsComponent implements OnInit, OnDestroy {
  acteSearch = '';
  actes: ActeDTO[] = [];
  patients: PatientDTO[] = [];
  showAssignModal = false;
  assigningRx: PrescriptionResponse | null = null;
  selectedActeId: number | null = null;

  prescriptions: PrescriptionResponse[] = [];
  loading = false;
  error = '';

  showDetail = false;
  detailRx: PrescriptionResponse | null = null;

  showModal = false;
  editMode = false;
  selectedId: number | null = null;
  saving = false;

  form: any = { patientId: null, acteDescription: '', typeOfActe: 'PRESCRIPTION', note: '', date: '' };

  activeFilter: PrescriptionStatus | 'ALL' = 'ALL';
  sortDesc = true;

  private pollSub?: Subscription;

  STATUS_META = STATUS_META;
  statusKeys: PrescriptionStatus[] = ['PENDING', 'VALIDATED', 'DISPENSED', 'COMPLETED', 'CANCELLED'];
  readonly STEPS: PrescriptionStatus[] = ['PENDING', 'VALIDATED', 'DISPENSED', 'COMPLETED'];

  constructor(private prescriptionService: PrescriptionService) {}

  ngOnInit(): void {
    this.loadAll();
    this.loadActes();
    this.loadPatients();
    this.pollSub = interval(30_000)
      .pipe(switchMap(() => this.prescriptionService.getAll()))
      .subscribe({
        next: (data) => {
          this.prescriptions = data.map(rx => ({
            ...rx,
            expanded: this.prescriptions.find(p => p.prescriptionID === rx.prescriptionID)?.expanded ?? false
          }));
          if (this.detailRx) {
            const updated = this.prescriptions.find(p => p.prescriptionID === this.detailRx!.prescriptionID);
            if (updated) this.detailRx = updated;
          }
        }
      });
  }

  ngOnDestroy(): void { this.pollSub?.unsubscribe(); }

  loadAll(): void {
    this.loading = true; this.error = '';
    this.prescriptionService.getAll().subscribe({
      next: (data) => { this.prescriptions = data.map(rx => ({ ...rx, expanded: false })); this.loading = false; },
      error: () => { this.error = 'Erreur lors du chargement des prescriptions.'; this.loading = false; }
    });
  }

  loadActes(): void {
    this.prescriptionService.getAllActes().subscribe({
      next: (data) => { console.log('ACTES REÇUS:', data); this.actes = data; },
      error: (err) => console.error('Erreur chargement actes', err)
    });
  }

  loadPatients(): void {
    this.prescriptionService.getAllPatients().subscribe({
      next: (data) => this.patients = data,
      error: (err) => console.error('Erreur chargement patients', err)
    });
  }

  get filtered(): PrescriptionResponse[] {
    let list = this.activeFilter === 'ALL'
      ? [...this.prescriptions]
      : this.prescriptions.filter(rx => rx.status === this.activeFilter);
    list.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return this.sortDesc ? -diff : diff;
    });
    return list;
  }

  countByStatus(s: PrescriptionStatus): number {
    return this.prescriptions.filter(rx => rx.status === s).length;
  }

  stepOf(status: PrescriptionStatus): number { return this.STEPS.indexOf(status); }

  statIcon(status: PrescriptionStatus): string {
    const map: Record<string, string> = {
      PENDING:   'bi-hourglass-split',
      VALIDATED: 'bi-patch-check-fill',
      DISPENSED: 'bi-bag-check-fill',
      COMPLETED: 'bi-check-circle-fill',
      CANCELLED: 'bi-x-circle-fill',
    };
    return map[status] ?? 'bi-capsule';
  }

  statusColor(status: PrescriptionStatus): string {
    return STATUS_META[status]?.color ?? '#64748b';
  }

  statusBg(status: PrescriptionStatus): string {
    return STATUS_META[status]?.bg ?? '#f8fafc';
  }

  statusBadgeClass(status: PrescriptionStatus): string {
    const map: Record<string, string> = {
      PENDING:   'badge-pending',
      VALIDATED: 'badge-validated',
      DISPENSED: 'badge-dispensed',
      COMPLETED: 'badge-completed',
      CANCELLED: 'badge-cancelled',
    };
    return map[status] ?? 'badge-pending';
  }

  openDetail(rx: PrescriptionResponse, event?: Event): void {
    event?.stopPropagation();
    this.detailRx = { ...rx }; this.showDetail = true;
  }
  closeDetail(): void { this.showDetail = false; this.detailRx = null; }

  openAddModal(): void {
    this.editMode = false; this.selectedId = null;
    const isoString = new Date().toISOString();
    this.form = { patientId: null, acteDescription: '', typeOfActe: 'PRESCRIPTION', note: '', date: isoString };
    this.showModal = true;
  }

  openEditModal(rx: PrescriptionResponse, event?: Event): void {
    event?.stopPropagation();
    this.editMode = true; this.selectedId = rx.prescriptionID;
    this.form = { patientId: null, acteDescription: '', typeOfActe: '', note: rx.note, date: new Date(rx.date).toISOString() };
    this.showModal = true;
  }

  openAssignModal(rx: PrescriptionResponse, event?: Event): void {
    event?.stopPropagation();
    this.assigningRx = rx;
    this.selectedActeId = rx.acteId ?? null;
    this.showAssignModal = true;
  }

  save(): void {
    if (this.saving) return;
    if (!this.editMode && !this.form.patientId) { this.error = "Veuillez sélectionner un patient."; return; }
    if (!this.editMode && !this.form.acteDescription) { this.error = "Veuillez fournir une description pour l'acte."; return; }

    let dateToSend = this.form.date;
    if (dateToSend && dateToSend.length === 16) dateToSend = dateToSend + ':00.000Z';
    const rxDataToSend = { note: this.form.note, date: dateToSend };
    this.saving = true;

    if (this.editMode && this.selectedId !== null) {
      this.prescriptionService.update(this.selectedId, rxDataToSend).subscribe({
        next: () => { this.showModal = false; this.saving = false; this.loadAll(); },
        error: () => { this.error = 'Erreur modification'; this.saving = false; }
      });
    } else {
      const acteReq = { date: dateToSend, description: this.form.acteDescription, typeOfActe: this.form.typeOfActe };
      this.prescriptionService.addActeForPatient(this.form.patientId, acteReq).pipe(
        switchMap(createdActe =>
          this.prescriptionService.add(rxDataToSend).pipe(
            switchMap(createdRx => this.prescriptionService.assignActe(createdRx.prescriptionID, createdActe.acteId))
          )
        ),
        catchError(err => { console.error("Erreur création unifiée:", err); throw err; })
      ).subscribe({
        next: () => { this.showModal = false; this.saving = false; this.loadAll(); this.loadActes(); },
        error: () => { this.error = "Erreur lors de la création de l'acte et de la prescription."; this.saving = false; }
      });
    }
  }

  saveAssign(): void {
    if (!this.assigningRx || this.selectedActeId === null) return;
    this.prescriptionService.assignActe(this.assigningRx.prescriptionID, this.selectedActeId).subscribe({
      next: () => { this.showAssignModal = false; this.loadAll(); },
      error: () => { this.error = "Erreur lors de l'affectation."; }
    });
  }

  get filteredActes(): ActeDTO[] {
    if (!this.acteSearch.trim()) return this.actes;
    const q = this.acteSearch.toLowerCase();
    return this.actes.filter(a =>
      a.patientName?.toLowerCase().includes(q) ||
      a.typeOfActe?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      String(a.acteId).includes(q)
    );
  }

  deletePrescription(id: number, event?: Event): void {
    event?.stopPropagation();
    if (!confirm('Voulez-vous vraiment supprimer cette prescription ?')) return;
    this.prescriptionService.delete(id).subscribe({
      next: () => {
        this.prescriptions = this.prescriptions.filter(rx => rx.prescriptionID !== id);
        if (this.detailRx?.prescriptionID === id) this.closeDetail();
      },
      error: () => { this.error = 'Erreur lors de la suppression.'; }
    });
  }

  trackById(_: number, rx: PrescriptionResponse): number { return rx.prescriptionID; }
}