import { Component } from '@angular/core';
@Component({
    selector: 'app-pharmacist-dashboard', template: `
  <div class="p-8">
    <div class="mb-8"><h1 class="text-2xl font-bold text-gray-900 mb-2">Pharmacist Dashboard</h1><p class="text-gray-600">Welcome back, Dr. Karim Benali</p></div>
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
export class PharmacistDashboardComponent {
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
}
