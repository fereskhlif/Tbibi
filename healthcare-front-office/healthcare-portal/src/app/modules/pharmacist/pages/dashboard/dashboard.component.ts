<<<<<<< Updated upstream
import { Component, OnInit } from '@angular/core';
@Component({
    selector: 'app-pharmacist-dashboard', template: `
  <div class="p-8">
    <div class="mb-8"><h1 class="text-2xl font-bold text-gray-900 mb-2">Pharmacist Dashboard</h1><p class="text-gray-600">Welcome back, {{ currentUserName }}</p></div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div *ngFor="let stat of stats" class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center gap-3 mb-3"><span class="text-2xl">{{stat.icon}}</span><span class="text-sm text-gray-500">{{stat.title}}</span></div>
        <p class="text-xl font-bold text-gray-900">{{stat.value}}</p><p class="text-sm text-gray-500 mt-1">{{stat.subtitle}}</p>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Pending Prescriptions</h3>
        <div class="space-y-3">
          <div *ngFor="let rx of prescriptions" class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span class="text-xl">💊</span><div class="flex-1"><p class="font-medium text-gray-900">{{rx.patient}}</p><p class="text-sm text-gray-500">{{rx.medication}} • Dr. {{rx.doctor}}</p></div>
            <button class="px-3 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700">Process</button>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
        <div class="space-y-3">
          <div *ngFor="let item of lowStockItems" class="flex items-center justify-between p-3 rounded-lg" [class]="item.critical ? 'bg-red-50' : 'bg-yellow-50'">
            <div><p class="font-medium text-gray-900">{{item.name}}</p><p class="text-sm text-gray-500">{{item.category}}</p></div>
            <div class="text-right"><p class="font-bold" [class]="item.critical ? 'text-red-600' : 'text-yellow-600'">{{item.stock}} units</p><p class="text-xs text-gray-500">Min: {{item.min}}</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
` })
export class PharmacistDashboardComponent implements OnInit {
    currentUserName: string = 'User';
    stats = [
        { icon: '📦', title: 'Pending Orders', value: '15', subtitle: '3 urgent' },
        { icon: '💊', title: 'Prescriptions Today', value: '28', subtitle: '12 processed' },
        { icon: '📊', title: 'Stock Alerts', value: '5', subtitle: '2 critical' },
        { icon: '💰', title: "Today's Revenue", value: '$2,450', subtitle: '+12% vs yesterday' }
    ];
    prescriptions = [
        { patient: 'John Doe', medication: 'Amoxicillin 500mg', doctor: 'Sarah Johnson' },
        { patient: 'Jane Smith', medication: 'Metformin 850mg', doctor: 'Ahmed Hassan' },
        { patient: 'Mike Brown', medication: 'Atorvastatin 20mg', doctor: 'Lisa Park' }
    ];
    lowStockItems = [
        { name: 'Amoxicillin 500mg', category: 'Antibiotics', stock: 5, min: 20, critical: true },
        { name: 'Paracetamol 1000mg', category: 'Pain Relief', stock: 15, min: 50, critical: true },
        { name: 'Vitamin D3 1000IU', category: 'Vitamins', stock: 30, min: 40, critical: false }
    ];

    ngOnInit(): void {
        const storedUserName = localStorage.getItem('UserName');
        this.currentUserName = storedUserName || 'User';
    }
=======
import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
// Screenshot libraries removed per user request
import { PharmacistMedicineService } from '../../services/pharmacist-medicine.service';
import { PharmacistOrderService } from '../../services/pharmacist-order.service';
import { PrescriptionService, PrescriptionResponse } from '../../../../services/prescription-service.service';
import { Medicine } from '../../models/medicine.model';
import { PharmacistOrder } from '../../models/pharmacist-order.model';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface CategoryCount {
  category: string;
  count: number;
  percentage: number;
}

interface AlertItem {
  type: 'critical' | 'warning' | 'expired';
  name: string;
  category: string | null;
  stock: number;
  min: number;
  expDate: string | null;
}

interface DailyRevenue {
  day: string;
  shortDay: string;
  amount: number;
  orderCount: number;
}

interface SalesRow {
  orderId: number;
  userName: string;
  userEmail: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  orderDate: string;
  orderStatus: string;
}

@Component({
  selector: 'app-pharmacist-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class PharmacistDashboardComponent implements OnInit {
  readonly PHARMACY_ID = 1;

  // State
  loading = true;
  today = new Date();

  // ─── Dropdown Menu State ────────────────────────────────
  activeDropdown: string | null = null;

  menuConfig: Record<string, Array<{ icon: string; label: string; disabled?: boolean }>> = {
    'stat-sales': [
      { icon: '📊', label: 'View Details' },
      { icon: '📥', label: 'Export Data' },
      { icon: '📅', label: 'Select Date Range' }
    ],
    'stat-categories': [
      { icon: '📊', label: 'View Details' },
      { icon: '📥', label: 'Export Data' }
    ],
    'stat-expired': [
      { icon: '📊', label: 'View Details' },
      { icon: '📥', label: 'Export Data' }
    ],
    'stat-users': [
      { icon: '📊', label: 'View Details' },
      { icon: '📥', label: 'Export Data' }
    ],
    'graph-report': [
      { icon: '⬇️', label: 'Download Chart' },
      { icon: '📋', label: 'View Full Report' },
      { icon: '🔄', label: 'Change Chart Type' },
      { icon: '🏷️', label: 'Filter by Category' }
    ],
    'total-sales': [
      { icon: '⬇️', label: 'Download Chart' },
      { icon: '📅', label: 'Change Date Range' },
      { icon: '📄', label: 'View Raw Data' }
    ],
    'recent-sales': [
      { icon: '📥', label: 'Export Table' },
      { icon: '🖨️', label: 'Print' },
      { icon: '⚙️', label: 'Customize Columns' },
      { icon: '☑️', label: 'Bulk Actions' }
    ]
  };

  // ─── Modal State ──────────────────────────────────────────
  activeModal: string | null = null;
  alertThreshold: number = 0;
  alertContext: string = '';
  dateRangeStart: string = '';
  dateRangeEnd: string = '';
  todayString: string = new Date().toISOString().split('T')[0];
  barChartDateLabel: string = 'Last 7 Days';
  graphChartType: 'donut' | 'bars' = 'donut';
  compareMode: boolean = false;
  previousPeriodRevenue: DailyRevenue[] = [];
  categoryFilter: string = '';

  // ─── Sales Period State (for KPI card) ──────────────────
  salesPeriodLabel: string = "Today's Sales";
  salesPeriodStart: string = '';
  salesPeriodEnd: string = '';

  // ─── Toast State ─────────────────────────────────────────
  toasts: ToastItem[] = [];
  private toastCounter = 0;

  toggleDropdown(id: string, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.activeDropdown = this.activeDropdown === id ? null : id;
  }

  onMenuAction(menuId: string, label: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeDropdown = null;

    switch (label) {
      // ── Download Chart ──
      case 'Download Chart':
        this.downloadChartAsPng(menuId === 'graph-report' ? 'donut' : 'bar');
        break;

      // ── View Details / View Full Report / View Raw Data ──
      case 'View Details':
        this.openModal('details-' + menuId.replace('stat-', ''));
        break;
      case 'View Full Report':
        this.openModal('view-report');
        break;
      case 'View Raw Data':
        this.openModal('raw-data');
        break;

      // ── Change Chart Type ──
      case 'Change Chart Type':
        this.graphChartType = this.graphChartType === 'donut' ? 'bars' : 'donut';
        break;

      // ── Change Date Range (bar chart) ──
      case 'Change Date Range':
        this.dateRangeStart = '';
        this.dateRangeEnd = '';
        this.openModal('date-range');
        break;

      // ── Select Date Range (KPI sales card) ──
      case 'Select Date Range':
        this.salesPeriodStart = '';
        this.salesPeriodEnd = '';
        this.openModal('sales-period');
        break;

      // ── Filter by Category ──
      case 'Filter by Category':
        this.openModal('filter-category');
        break;

      // ── Export Data / Export Table ──
      case 'Export Data':
        this.exportStatCsv(menuId);
        break;
      case 'Export Table':
        this.exportSalesTableCsv();
        break;

      // ── Print ──
      case 'Print':
        window.print();
        break;

      // ── Customize Columns ──
      case 'Customize Columns':
        this.showToast('Column customization coming soon', 'success');
        break;

      // ── Bulk Actions ──
      case 'Bulk Actions':
        this.showToast('Select rows to perform bulk actions', 'success');
        break;

      default:
        this.showToast(`${label} — feature coming soon`, 'success');
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.activeDropdown = null;
  }

  @HostListener('document:keydown.escape')
  onEscKey(): void {
    if (this.activeModal) {
      this.closeModal();
    } else {
      this.activeDropdown = null;
    }
  }

  // ─── Modal Helpers ───────────────────────────────────────
  openModal(id: string): void {
    this.activeModal = id;
  }

  closeModal(): void {
    this.activeModal = null;
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  // ─── Toast System ───────────────────────────────────────
  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    const id = ++this.toastCounter;
    this.toasts.push({ id, message, type });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 3000);
  }

  // ─── Download Chart as PNG ──────────────────────────────
  downloadChartAsPng(context: 'donut' | 'bar'): void {
    this.activeDropdown = null;
    this.showToast('Rendering chart...');

    setTimeout(() => {
      if (context === 'donut') {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 500, 500);

        // Extract true chart data from component state
        const data = [
          { label: 'Healthy', value: this.donutHealthy.length, color: '#D9F99D' },
          { label: 'Low Stock', value: this.donutLowStock.length, color: '#99F6E4' },
          { label: 'Out of Stock', value: this.donutOutOfStock.length, color: '#FBCFE8' },
          { label: 'Expired', value: this.donutExpired.length, color: '#FECACA' },
        ];

        const total = data.reduce((sum, d) => sum + d.value, 0);
        let startAngle = -Math.PI / 2;
        const cx = 250, cy = 200, radius = 130, thickness = 40;

        // Draw donut segments
        if (total > 0) {
          data.forEach(segment => {
            if (segment.value === 0) return;
            const slice = (segment.value / total) * 2 * Math.PI;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
            ctx.arc(cx, cy, radius - thickness, startAngle + slice, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = segment.color;
            ctx.fill();
            startAngle += slice;
          });
        } else {
          // Empty state
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
          ctx.arc(cx, cy, radius - thickness, 0, 2 * Math.PI, true);
          ctx.closePath();
          ctx.fillStyle = '#e2e8f0';
          ctx.fill();
        }

        // Center text
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Total', cx, cy - 5);
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(total.toString(), cx, cy + 30);

        // Legend
        data.forEach((d, i) => {
          const lx = 40, ly = 380 + i * 30;

          ctx.fillStyle = d.color;

          // Draw rounded rectangle for legend color
          ctx.beginPath();
          ctx.roundRect(lx, ly, 20, 20, 4);
          ctx.fill();

          ctx.fillStyle = '#334155';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'left';
          const percent = total > 0 ? Math.round((d.value / total) * 100) : 0;
          ctx.fillText(`${d.label} (${percent}%) - ${d.value} items`, lx + 32, ly + 15);
        });

        // Title
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Graph Report - Inventory Health', 40, 40);

        // Download payload
        try {
          const link = document.createElement('a');
          link.download = `graph-report-${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.showToast('Chart downloaded successfully!');
        } catch (err: any) {
          console.error('Canvas export error:', err);
          this.showToast('Download failed: ' + (err?.message || 'unknown error'), 'error');
        }
      }

      if (context === 'bar') {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 450;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 600, 450);

        // Title
        ctx.fillStyle = '#333';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Total Sales Overview', 40, 45);

        // Subtitle — date range
        ctx.fillStyle = '#888';
        ctx.font = '14px Arial';
        const startLabel = this.dateRangeStart
          ? new Date(this.dateRangeStart).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'Last 7 Days';
        const endLabel = this.dateRangeEnd
          ? new Date(this.dateRangeEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        ctx.fillText(`Period: ${startLabel} → ${endLabel}`, 40, 70);

        // Use your actual dailyRevenue array here
        const bars = this.dailyRevenue;
        const max = Math.max(...bars.map(b => b.amount), 1);

        // Provide an offset for Y-Axis labels
        const leftOffset = 60;
        const barWidth = 50;
        const gap = (600 - leftOffset - 40 - bars.length * barWidth) / (bars.length + 1);
        const colors = ['#a8e6a3', '#b5aaee', '#f4a7c3', '#f5e17a', '#81d4d0', '#a8e6a3', '#89c4f4'];

        // Draw horizontal grid lines and Y-axis labels (shifted down by 30px)
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';

        [1, 0.75, 0.5, 0.25, 0].forEach(ratio => {
          const gy = 360 - ratio * 260;
          const val = max * ratio;
          const label = max >= 1000 ? `${(val / 1000).toFixed(1)}k DT` : `${Math.round(val)} DT`;

          // Draw text
          ctx.fillText(label, leftOffset - 10, gy + 4);

          // Draw dashed line
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#e0e0e0';
          ctx.beginPath();
          ctx.moveTo(leftOffset, gy);
          ctx.lineTo(560, gy);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        bars.forEach((bar, i) => {
          const barHeight = Math.max(5, (bar.amount / max) * 260); // minimum visual height
          const x = leftOffset + gap + i * (barWidth + gap);
          const y = 360 - barHeight;

          ctx.fillStyle = colors[i % colors.length];

          const r = 10;
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + barWidth - r, y);
          ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
          ctx.lineTo(x + barWidth, y + barHeight);
          ctx.lineTo(x, y + barHeight);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#334155';
          ctx.font = '13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(bar.shortDay, x + barWidth / 2, 385);

          // Format text properly so small values don't look like 0.0k
          const valText = bar.amount >= 1000 ? `${(bar.amount / 1000).toFixed(1)}k DT` : `${Math.round(bar.amount)} DT`;
          ctx.fillText(valText, x + barWidth / 2, y - 8);
        });

        // Download payload
        try {
          const link = document.createElement('a');
          link.download = `sales-overview-${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.showToast('Chart downloaded successfully!');
        } catch (err: any) {
          console.error('Canvas export error:', err);
          this.showToast('Download failed: ' + (err?.message || 'unknown error'), 'error');
        }
      }

    }, 300);
  }

  // ─── Compare Mode Toggle ────────────────────────────────
  toggleCompareMode(): void {
    this.compareMode = !this.compareMode;
    if (this.compareMode) {
      this.buildPreviousPeriodRevenue();
      this.showToast('Comparing with previous period');
    } else {
      this.previousPeriodRevenue = [];
      this.showToast('Comparison mode disabled');
    }
  }

  private buildPreviousPeriodRevenue(): void {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const days: DailyRevenue[] = [];
    for (let i = 13; i >= 7; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayOrders = this.allOrders.filter(o => {
        const od = new Date(o.orderDate);
        return od.toDateString() === dateStr && o.orderStatus === 'DELIVERED';
      });
      const amount = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      days.push({
        day: fullDayNames[date.getDay()],
        shortDay: dayNames[date.getDay()],
        amount,
        orderCount: dayOrders.length
      });
    }
    this.previousPeriodRevenue = days;
  }

  getPrevBarHeight(amount: number): number {
    const max = Math.max(this.maxDailyRevenue, ...this.previousPeriodRevenue.map(d => d.amount), 1);
    return Math.max(5, (amount / max) * 100);
  }

  // ─── Apply Date Range Filter ────────────────────────────
  applyDateRange(): void {
    if (!this.dateRangeStart || !this.dateRangeEnd) {
      this.showToast('Please select both start and end dates', 'error');
      return;
    }
    if (this.dateRangeStart > this.dateRangeEnd) {
      this.showToast('Start date cannot be after end date', 'error');
      return;
    }
    const start = new Date(this.dateRangeStart);
    const end = new Date(this.dateRangeEnd);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const days: DailyRevenue[] = [];
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toDateString();
      const dayOrders = this.allOrders.filter(o => {
        const od = new Date(o.orderDate);
        return od.toDateString() === dateStr && o.orderStatus === 'DELIVERED';
      });
      const amount = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      days.push({
        day: fullDayNames[current.getDay()],
        shortDay: dayNames[current.getDay()],
        amount,
        orderCount: dayOrders.length
      });
      current.setDate(current.getDate() + 1);
    }

    this.dailyRevenue = days;
    this.maxDailyRevenue = Math.max(...days.map(d => d.amount), 1);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    this.barChartDateLabel = `${fmt(start)} – ${fmt(end)}`;
    this.closeModal();
    this.showToast('Date range applied');
  }

  resetDateRange(): void {
    this.dateRangeStart = '';
    this.dateRangeEnd = '';
    this.buildDailyRevenue();
    this.barChartDateLabel = 'Last 7 Days';
    this.closeModal();
    this.showToast('Reset to last 7 days');
  }

  // ─── Save Alert Threshold ───────────────────────────────
  saveAlert(): void {
    if (this.alertThreshold < 0) {
      this.showToast('Threshold must be a positive number', 'error');
      return;
    }
    localStorage.setItem('tbibi-alert-' + this.alertContext, String(this.alertThreshold));
    this.closeModal();
    this.showToast('Alert threshold saved!');
  }

  // ─── Export CSV Helpers ─────────────────────────────────
  private downloadCsv(filename: string, csvContent: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    this.showToast(`${filename} downloaded`);
  }

  exportStatCsv(menuId: string): void {
    let csv = '';
    const dateStamp = new Date().toISOString().split('T')[0];
    switch (menuId) {
      case 'stat-sales':
        csv = 'Patient Name,Medicine,Quantity,Price (DT),Time\n';
        this.todaySalesDetails.forEach(r => {
          csv += `"${r.userName}","${r.medicineName}",${r.quantity},${r.totalPrice.toFixed(2)},${r.orderDate}\n`;
        });
        this.downloadCsv(`today-sales-${dateStamp}.csv`, csv);
        break;
      case 'stat-categories':
        csv = 'Category,Medicine Count,Stock Status\n';
        this.categoriesWithStatus.forEach(c => {
          csv += `"${c.category}",${c.count},"${c.stockLabel}"\n`;
        });
        this.downloadCsv(`categories-${dateStamp}.csv`, csv);
        break;
      case 'stat-expired':
        csv = 'Medicine,Category,Expiry Date,Stock,Status\n';
        this.expiredItems.forEach(m => {
          csv += `"${m.medicineName}","${m.category || 'N/A'}",${m.dateOfExpiration},${m.stock},Expired\n`;
        });
        this.expiringSoonItems.forEach(item => {
          csv += `"${item.name}","${item.category}",${item.expDate},—,Expiring in ${item.daysLeft} days\n`;
        });
        this.downloadCsv(`expired-medicines-${dateStamp}.csv`, csv);
        break;
      case 'stat-users':
        csv = 'Customer Name,Email,Total Orders,Last Order Date\n';
        this.customerDetails.forEach(c => {
          csv += `"${c.name}","${c.email}",${c.totalOrders},${c.lastOrderDate}\n`;
        });
        this.downloadCsv(`customers-${dateStamp}.csv`, csv);
        break;
    }
  }

  exportSalesTableCsv(): void {
    let csv = 'Patient Name,Email,Medicine,Quantity,Unit Price,Total Price,Order Date,Status\n';
    this.filteredSalesList.forEach(r => {
      csv += `"${r.userName}","${r.userEmail}","${r.medicineName}",${r.quantity},${r.unitPrice.toFixed(2)},${r.totalPrice.toFixed(2)},${r.orderDate},${r.orderStatus}\n`;
    });
    this.downloadCsv('sales-table.csv', csv);
  }

  // ─── Data Helpers for Modals ────────────────────────────
  getCategoryCounts(): CategoryCount[] {
    const map = new Map<string, number>();
    this.allMedicines.forEach(m => {
      const cat = m.category || 'Uncategorized';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    const total = this.allMedicines.length || 1;
    return Array.from(map.entries())
      .map(([category, count]) => ({ category, count, percentage: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);
  }

  getUniqueUsersList(): Array<{ name: string; orders: number }> {
    const map = new Map<string, number>();
    this.allOrders.forEach(o => {
      map.set(o.userName, (map.get(o.userName) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, orders]) => ({ name, orders }))
      .sort((a, b) => b.orders - a.orders);
  }

  getFilteredCategoryCounts(): CategoryCount[] {
    if (!this.categoryFilter) return this.getCategoryCounts();
    return this.getCategoryCounts().filter(c =>
      c.category.toLowerCase().includes(this.categoryFilter.toLowerCase())
    );
  }

  applyCategoryFilter(): void {
    this.closeModal();
    this.showToast(this.categoryFilter ? `Filtering by "${this.categoryFilter}"` : 'Showing all categories');
  }

  // ─── Enriched Modal Data ────────────────────────────────
  get todaySalesDetails(): SalesRow[] {
    if (this.salesPeriodStart && this.salesPeriodEnd) {
      const start = new Date(this.salesPeriodStart);
      const end = new Date(this.salesPeriodEnd);
      end.setHours(23, 59, 59, 999);
      return this.allSalesRows.filter(r => {
        const d = new Date(r.orderDate);
        return d >= start && d <= end;
      });
    }
    const todayStr = new Date().toDateString();
    return this.allSalesRows.filter(r => new Date(r.orderDate).toDateString() === todayStr);
  }

  get todaySalesTotal(): number {
    return this.todaySalesDetails.reduce((sum, r) => sum + r.totalPrice, 0);
  }

  get mostSoldToday(): { name: string; qty: number } | null {
    const rows = this.todaySalesDetails;
    if (rows.length === 0) return null;
    const map = new Map<string, number>();
    rows.forEach(r => map.set(r.medicineName, (map.get(r.medicineName) || 0) + r.quantity));
    let maxName = ''; let maxQty = 0;
    map.forEach((qty, name) => { if (qty > maxQty) { maxQty = qty; maxName = name; } });
    return { name: maxName, qty: maxQty };
  }

  get categoriesWithStatus(): Array<{ category: string; count: number; percentage: number; stockLabel: string; statusClass: string }> {
    const map = new Map<string, Medicine[]>();
    this.allMedicines.forEach(m => {
      const cat = m.category || 'Uncategorized';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(m);
    });
    const total = this.totalMedicines || 1;
    return Array.from(map.entries()).map(([category, meds]) => {
      const outOfStock = meds.filter(m => m.stock === 0).length;
      const lowStock = meds.filter(m => m.stock > 0 && m.stock <= m.minStockAlert).length;
      let stockLabel = '✅ Good'; let statusClass = 'cat-good';
      if (outOfStock > 0) { stockLabel = `❌ ${outOfStock} Out`; statusClass = 'cat-out'; }
      else if (lowStock > 0) { stockLabel = `⚠️ ${lowStock} Low`; statusClass = 'cat-low'; }
      return { category, count: meds.length, percentage: Math.round((meds.length / total) * 100), stockLabel, statusClass };
    }).sort((a, b) => b.count - a.count);
  }

  get expiringSoonItems(): Array<{ name: string; category: string; expDate: string; daysLeft: number }> {
    const now = new Date();
    const in30 = new Date(); in30.setDate(in30.getDate() + 30);
    return this.allMedicines
      .filter(m => { const exp = new Date(m.dateOfExpiration); return exp > now && exp <= in30; })
      .map(m => {
        const exp = new Date(m.dateOfExpiration);
        const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { name: m.medicineName, category: m.category || 'N/A', expDate: m.dateOfExpiration, daysLeft };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }

  get customerDetails(): Array<{ name: string; email: string; totalOrders: number; lastOrderDate: string }> {
    const map = new Map<string, { count: number; lastDate: Date; email: string }>();
    this.allOrders.forEach(o => {
      const d = new Date(o.orderDate);
      const existing = map.get(o.userName);
      if (!existing) {
        map.set(o.userName, { count: 1, lastDate: d, email: o.userEmail });
      }
      else {
        existing.count++;
        if (d > existing.lastDate) existing.lastDate = d;
      }
    });
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, email: data.email, totalOrders: data.count, lastOrderDate: data.lastDate.toISOString() }))
      .sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());
  }

  // ─── Card Click → Open Details Modal ────────────────────
  openCardDetails(card: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openModal('details-' + card);
  }

  // ─── Sales Period Picker ────────────────────────────────
  get displayedSalesRevenue(): number {
    if (this.salesPeriodStart && this.salesPeriodEnd) {
      const start = new Date(this.salesPeriodStart);
      const end = new Date(this.salesPeriodEnd); end.setHours(23, 59, 59, 999);
      return this.calcRevenue(this.allOrders.filter(o => {
        const d = new Date(o.orderDate);
        return o.orderStatus === 'DELIVERED' && d >= start && d <= end;
      }));
    }
    return this.todayRevenue;
  }

  applySalesPeriod(): void {
    if (!this.salesPeriodStart || !this.salesPeriodEnd) {
      this.showToast('Please select both dates', 'error'); return;
    }
    if (this.salesPeriodStart > this.salesPeriodEnd) {
      this.showToast('Start date cannot be after end date', 'error'); return;
    }
    const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    this.salesPeriodLabel = `Sales: ${fmt(this.salesPeriodStart)} → ${fmt(this.salesPeriodEnd)}`;
    this.closeModal();
    this.showToast('Sales period updated');
  }

  resetSalesPeriod(): void {
    this.salesPeriodStart = '';
    this.salesPeriodEnd = '';
    this.salesPeriodLabel = "Today's Sales";
    this.closeModal();
    this.showToast('Reset to today');
  }

  // ─── HBar Data for Chart Toggle ─────────────────────────
  getHBarData(): Array<{ label: string; count: number; percent: number; color: string }> {
    const data = [
      { label: 'Healthy', count: this.donutHealthy.length, percent: this.healthyPercent, color: '#D9F99D' },
      { label: 'Low Stock', count: this.donutLowStock.length, percent: this.lowStockPercent, color: '#99F6E4' },
      { label: 'Out of Stock', count: this.donutOutOfStock.length, percent: this.outOfStockPercent, color: '#FBCFE8' },
      { label: 'Expired', count: this.donutExpired.length, percent: this.expiredPercentNum, color: '#FCA5A5' },
    ];
    return data.filter(d => d.count > 0);
  }

  // Medicines data
  allMedicines: Medicine[] = [];
  lowStockItems: Medicine[] = [];
  expiredItems: Medicine[] = [];

  // Orders data
  allOrders: PharmacistOrder[] = [];
  recentOrders: PharmacistOrder[] = [];

  // Prescriptions data
  allPrescriptions: PrescriptionResponse[] = [];

  // Custom JPQL complex query data
  topSellingMedicines: any[] = [];

  totalOrdersCount: number = 0;

  // Math object for template
  Math = Math;

  // ─── Sales List State ──────────────────────────────────
  salesSearchTerm = '';
  salesStatusFilter = 'ALL';
  salesPage = 1;
  readonly salesPageSize = 5;
  allSalesRows: SalesRow[] = [];

  // ─── Computed KPIs ────────────────────────────────────
  get totalMedicines(): number { return this.allMedicines.length; }

  get inStockMedicines(): number {
    return this.allMedicines.filter(m => m.stock > 0 && !this.isExpired(m)).length;
  }

  get outOfStockMedicines(): number {
    return this.allMedicines.filter(m => m.stock === 0).length;
  }

  get totalOrders(): number { return this.allOrders.length; }

  get pendingOrders(): number {
    return this.allOrders.filter(o => o.orderStatus === 'PENDING').length;
  }

  get confirmedOrders(): number {
    return this.allOrders.filter(o => o.orderStatus === 'CONFIRMED').length;
  }

  get deliveredOrders(): number {
    return this.allOrders.filter(o => o.orderStatus === 'DELIVERED').length;
  }

  get criticalStockCount(): number {
    return this.lowStockItems.filter(m => m.stock <= 5).length;
  }

  get expiringSoonCount(): number {
    const now = new Date();
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    return this.allMedicines.filter(m => {
      const exp = new Date(m.dateOfExpiration);
      return exp > now && exp <= in30;
    }).length;
  }

  // ─── NEW: Unique Categories ────────────────────────────
  get uniqueCategories(): number {
    const cats = new Set(this.allMedicines.map(m => m.category).filter(c => !!c));
    return cats.size || 0;
  }

  // ─── NEW: Unique Patients (from orders) ────────────────
  get uniquePatients(): number {
    const ids = new Set(this.allOrders.map(o => o.userId));
    return ids.size;
  }

  // ─── NEW: Expired Percentage ───────────────────────────
  get expiredPercent(): string {
    if (this.totalMedicines === 0) return '0';
    const pct = (this.expiredItems.length / this.totalMedicines) * 100;
    if (pct === 0) return '0';
    return pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(2);
  }

  // ─── Revenue ───────────────────────────────────────────
  get todayRevenue(): number {
    return this.calcRevenue(this.getOrdersInPeriod('today'));
  }
  get todayOrders(): number {
    return this.getOrdersInPeriod('today').length;
  }
  get weekRevenue(): number {
    return this.calcRevenue(this.getOrdersInPeriod('week'));
  }
  get weekOrders(): number {
    return this.getOrdersInPeriod('week').length;
  }
  get monthRevenue(): number {
    return this.calcRevenue(this.getOrdersInPeriod('month'));
  }
  get monthOrders(): number {
    return this.getOrdersInPeriod('month').length;
  }

  // ─── NEW: Daily Revenue (last 7 days for bar chart) ────
  dailyRevenue: DailyRevenue[] = [];
  maxDailyRevenue = 0;

  private buildDailyRevenue(): void {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const days: DailyRevenue[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayOrders = this.allOrders.filter(o => {
        const od = new Date(o.orderDate);
        return od.toDateString() === dateStr && o.orderStatus === 'DELIVERED';
      });
      const amount = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      days.push({
        day: fullDayNames[date.getDay()],
        shortDay: dayNames[date.getDay()],
        amount,
        orderCount: dayOrders.length
      });
    }

    this.dailyRevenue = days;
    this.maxDailyRevenue = Math.max(...days.map(d => d.amount), 1);
  }

  getBarHeight(amount: number): number {
    if (this.maxDailyRevenue === 0) return 5;
    return Math.max(5, (amount / this.maxDailyRevenue) * 100);
  }

  getBarColor(index: number): string {
    const colors = [
      '#A7F3D0', '#6EE7B7', '#F9A8D4', '#FDE68A',
      '#C4B5FD', '#A7F3D0', '#93C5FD'
    ];
    return colors[index % colors.length];
  }

  // ─── Dynamic Y-Axis Labels ───────────────────────────────
  getYAxisLabels(): string[] {
    const labels = [];
    const max = this.maxDailyRevenue;
    for (let i = 5; i >= 0; i--) {
      const val = (max / 5) * i;
      const label = max >= 1000 ? `${(val / 1000).toFixed(1)}k DT` : `${Math.round(val)} DT`;
      labels.push(label);
    }
    return labels;
  }

  // ─── Prescription Counts ───────────────────────────────
  get rxCounts() {
    const counts = { pending: 0, validated: 0, dispensed: 0, completed: 0, cancelled: 0 };
    this.allPrescriptions.forEach(rx => {
      const s = (rx.status || '').toUpperCase();
      if (s === 'PENDING') counts.pending++;
      else if (s === 'VALIDATED') counts.validated++;
      else if (s === 'DISPENSED') counts.dispensed++;
      else if (s === 'COMPLETED') counts.completed++;
      else if (s === 'CANCELLED') counts.cancelled++;
    });
    return counts;
  }

  get totalPrescriptions(): number {
    return this.allPrescriptions.length;
  }

  // ─── Inventory Health (Donut Chart) ────────────────────
  get donutHealthy(): Medicine[] {
    return this.allMedicines.filter(m => m.stock > m.minStockAlert && !this.isExpired(m));
  }

  get donutLowStock(): Medicine[] {
    return this.allMedicines.filter(m => m.stock > 0 && m.stock <= m.minStockAlert && !this.isExpired(m));
  }

  get donutOutOfStock(): Medicine[] {
    return this.allMedicines.filter(m => m.stock === 0);
  }

  get donutExpired(): Medicine[] {
    return this.allMedicines.filter(m => m.stock > 0 && this.isExpired(m));
  }

  get healthyPercent(): number {
    return this.totalMedicines ? Math.round((this.donutHealthy.length / this.totalMedicines) * 100) : 100;
  }

  get lowStockPercent(): number {
    return this.totalMedicines ? Math.round((this.donutLowStock.length / this.totalMedicines) * 100) : 0;
  }

  get outOfStockPercent(): number {
    return this.totalMedicines ? Math.round((this.donutOutOfStock.length / this.totalMedicines) * 100) : 0;
  }

  get expiredPercentNum(): number {
    return this.totalMedicines ? Math.round((this.donutExpired.length / this.totalMedicines) * 100) : 0;
  }

  private readonly CIRCUMFERENCE = 282.74; // 2 * π * 45

  get healthyArc(): number {
    return this.totalMedicines ? (this.donutHealthy.length / this.totalMedicines) * this.CIRCUMFERENCE : this.CIRCUMFERENCE;
  }

  get lowStockArc(): number {
    return this.totalMedicines ? (this.donutLowStock.length / this.totalMedicines) * this.CIRCUMFERENCE : 0;
  }

  get outOfStockArc(): number {
    return this.totalMedicines ? (this.donutOutOfStock.length / this.totalMedicines) * this.CIRCUMFERENCE : 0;
  }

  get expiredArc(): number {
    return this.totalMedicines ? (this.donutExpired.length / this.totalMedicines) * this.CIRCUMFERENCE : 0;
  }

  // ─── Dynamic Floating Labels ─────────────────────────────
  get donutLabels() {
    const labels: Array<{ percent: number, left: string, top: string, class: string }> = [];
    if (this.totalMedicines === 0) return labels;

    let currentAngle = -90; // SVG starts drawing from top (-90 degrees)
    const radius = 38; // Distance from center in percentage (Donut is inside 0..100)

    const addLabel = (count: number, cssClass: string) => {
      if (count === 0) return;

      const angleSpan = (count / this.totalMedicines) * 360;
      const midAngle = currentAngle + (angleSpan / 2);
      const rad = midAngle * (Math.PI / 180);

      // Calculate offset based on 50% midpoint
      const left = 50 + radius * Math.cos(rad);
      const top = 50 + radius * Math.sin(rad);

      labels.push({
        percent: Math.round((count / this.totalMedicines) * 100),
        left: `${left}%`,
        top: `${top}%`,
        class: cssClass
      });

      currentAngle += angleSpan;
    };

    addLabel(this.donutHealthy.length, 'lbl-green');
    addLabel(this.donutLowStock.length, 'lbl-teal');
    addLabel(this.donutOutOfStock.length, 'lbl-pink');
    addLabel(this.donutExpired.length, 'lbl-red');

    return labels;
  }

  // ─── Combined Alerts ───────────────────────────────────
  get combinedAlerts(): AlertItem[] {
    const alerts: AlertItem[] = [];

    const sortedLow = [...this.lowStockItems].sort((a, b) => a.stock - b.stock);
    sortedLow.forEach(m => {
      alerts.push({
        type: m.stock <= 5 ? 'critical' : 'warning',
        name: m.medicineName,
        category: m.category || null,
        stock: m.stock,
        min: m.minStockAlert,
        expDate: null,
      });
    });

    this.expiredItems.forEach(m => {
      if (!sortedLow.find(l => l.medicineId === m.medicineId)) {
        alerts.push({
          type: 'expired',
          name: m.medicineName,
          category: m.category || null,
          stock: m.stock,
          min: m.minStockAlert,
          expDate: m.dateOfExpiration,
        });
      }
    });

    return alerts.slice(0, 8);
  }

  // ─── Sales List (filtered + paged) ─────────────────────
  get filteredSalesList(): SalesRow[] {
    let list = [...this.allSalesRows];
    if (this.salesStatusFilter !== 'ALL') {
      list = list.filter(r => r.orderStatus === this.salesStatusFilter);
    }
    if (this.salesSearchTerm.trim()) {
      const q = this.salesSearchTerm.toLowerCase().trim();
      list = list.filter(r =>
        r.userName.toLowerCase().includes(q) ||
        r.medicineName.toLowerCase().includes(q)
      );
    }
    return list;
  }

  get salesTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredSalesList.length / this.salesPageSize));
  }

  get pagedSalesList(): SalesRow[] {
    const start = (this.salesPage - 1) * this.salesPageSize;
    return this.filteredSalesList.slice(start, start + this.salesPageSize);
  }

  get salesPageNumbers(): number[] {
    const total = this.salesTotalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (this.salesPage <= 4) return [1, 2, 3, 4, 5, -1, total];
    if (this.salesPage >= total - 3) return [1, -1, total - 4, total - 3, total - 2, total - 1, total];
    return [1, -1, this.salesPage - 1, this.salesPage, this.salesPage + 1, -1, total];
  }

  onSalesSearch(term: string): void {
    this.salesSearchTerm = term;
    this.salesPage = 1;

    if (term.includes('@') && term.length > 4) {
      this.orderService.getOrdersByPharmacyAndUserEmail(this.PHARMACY_ID, term).subscribe({
        next: (res) => {
          this.allOrders = res;
          this.buildSalesRows();
          this.showToast(`Fetched patient history`);
        }
      });
    } else if (term === '' || (!term.includes('@') && this.allOrders.length < this.totalOrdersCount)) {
      this.orderService.getOrdersByPharmacy(this.PHARMACY_ID).subscribe({
        next: (res) => {
          this.allOrders = res;
          this.buildSalesRows();
        }
      });
    }
  }

  onSalesFilterChange(status: string): void {
    this.salesStatusFilter = status;
    this.salesPage = 1;
  }

  goToSalesPage(page: number): void {
    if (page < 1 || page > this.salesTotalPages) return;
    this.salesPage = page;
  }

  private buildSalesRows(): void {
    const rows: SalesRow[] = [];
    this.allOrders.forEach(order => {
      order.orderLines.forEach(line => {
        rows.push({
          orderId: order.orderId,
          userName: order.userName,
          userEmail: order.userEmail,
          medicineName: line.medicineName || '—',
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          totalPrice: line.quantity * line.unitPrice,
          orderDate: order.orderDate,
          orderStatus: order.orderStatus,
        });
      });
    });
    this.allSalesRows = rows;
  }

  // ─── Time of Day ───────────────────────────────────────
  get timeOfDay(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  constructor(
    private router: Router,
    private medicineService: PharmacistMedicineService,
    private orderService: PharmacistOrderService,
    private prescriptionService: PrescriptionService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // ─── Data Loading ──────────────────────────────────────
  loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      medicines: this.medicineService.getAll(),
      lowStock: this.medicineService.getLowStock(),
      expired: this.medicineService.getExpired(),
      orders: this.orderService.getOrdersByPharmacy(this.PHARMACY_ID),
      prescriptions: this.prescriptionService.getAll(),
      topSelling: this.medicineService.getTopSellingMedicines(this.PHARMACY_ID)
    }).subscribe({
      next: (data) => {
        this.allMedicines = data.medicines || [];
        this.lowStockItems = data.lowStock || [];
        this.expiredItems = data.expired || [];

        this.allOrders = (data.orders || []).sort(
          (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        this.totalOrdersCount = this.allOrders.length;
        this.recentOrders = this.allOrders.slice(0, 6);

        this.allPrescriptions = data.prescriptions || [];

        // Build derived data
        this.buildDailyRevenue();
        this.buildSalesRows();

        this.topSellingMedicines = data.topSelling || [];
        console.log("Top Selling Medicines JPQL Output:", this.topSellingMedicines);

        this.loading = false;
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
        this.loading = false;
      }
    });
  }

  refreshAll(): void {
    this.today = new Date();
    this.loadDashboardData();
  }

  // ─── Navigation ────────────────────────────────────────
  navigateTo(path: string): void {
    this.router.navigate([`/pharmacist/${path}`]);
  }

  // ─── Helpers ───────────────────────────────────────────
  private isExpired(med: Medicine): boolean {
    return new Date(med.dateOfExpiration) < new Date();
  }

  private getOrdersInPeriod(period: 'today' | 'week' | 'month'): PharmacistOrder[] {
    const now = new Date();
    const delivered = this.allOrders.filter(o => o.orderStatus === 'DELIVERED');

    return delivered.filter(o => {
      const orderDate = new Date(o.orderDate);
      switch (period) {
        case 'today':
          return orderDate.toDateString() === now.toDateString();
        case 'week': {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        }
        case 'month': {
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return orderDate >= monthAgo;
        }
      }
    });
  }

  private calcRevenue(orders: PharmacistOrder[]): number {
    return orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #0D4E4A, #1A8F85)',
      'linear-gradient(135deg, #3B82F6, #60A5FA)',
      'linear-gradient(135deg, #8B5CF6, #A78BFA)',
      'linear-gradient(135deg, #EC4899, #F472B6)',
      'linear-gradient(135deg, #10B981, #34D399)',
      'linear-gradient(135deg, #06B6D4, #22D3EE)',
      'linear-gradient(135deg, #F59E0B, #FBBF24)',
      'linear-gradient(135deg, #EF4444, #F87171)',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getStatusCssClass(status: string): string {
    const map: Record<string, string> = {
      'PENDING': 'pending',
      'CONFIRMED': 'confirmed',
      'IN_PROGRESS': 'in-progress',
      'DELIVERED': 'delivered',
      'REJECTED': 'rejected',
      'CANCELLED': 'cancelled',
    };
    return map[status] || 'cancelled';
  }

  formatStatus(status: string): string {
    return (status || '').replace(/_/g, ' ');
  }
>>>>>>> Stashed changes
}
