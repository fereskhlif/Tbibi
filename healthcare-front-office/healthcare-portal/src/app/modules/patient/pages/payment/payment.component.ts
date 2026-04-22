import { Component, OnInit } from '@angular/core';
import { PaymentService, PaymentResponse } from '../../services/payment.service';
import { PaymentHistoryService, PaymentHistoryResponse } from '../../services/payment-history.service';

@Component({
  selector: 'app-payment',
  template: `
    <div style="min-height: 100vh; background-color: #F8FAFC; padding-bottom: 5rem; font-family: ui-sans-serif, system-ui, sans-serif;">
        
        <!-- Premium Blue/Indigo Header -->
        <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 5rem 1.5rem; position: relative; overflow: hidden; color: white; margin-bottom: -3rem;">
            <div style="position: absolute; top: -10%; left: -5%; width: 300px; height: 300px; background: rgba(37, 99, 235, 0.1); border-radius: 50%; filter: blur(60px);"></div>
            <div style="position: absolute; bottom: -10%; right: -5%; width: 400px; height: 400px; background: rgba(37, 99, 235, 0.05); border-radius: 50%; filter: blur(60px);"></div>
            
            <div style="max-width: 1280px; margin: 0 auto; position: relative; z-index: 10;">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="background: rgba(255,255,255,0.1); width: fit-content; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; padding: 4px 12px; border-radius: 99px; border: 1px solid rgba(255,255,255,0.15); margin-bottom: 8px;">
                        Billing Console
                    </div>
                    <h1 style="font-size: 3rem; font-weight: 900; letter-spacing: -0.04em; margin-bottom: 0.5rem; line-height: 1;">Financial Management</h1>
                    <p style="font-size: 1.125rem; color: #94a3b8; font-weight: 500; max-width: 600px;">
                        Oversee your pharmaceutical transactions and specialized medical billing history.
                    </p>
                </div>
            </div>
        </div>

        <div style="max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; position: relative; z-index: 20;">
            
            <!-- LOADING STATE -->
            <div *ngIf="loading" style="background: white; border: 1px solid #f1f5f9; border-radius: 2.5rem; padding: 6rem 2rem; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="width: 3rem; height: 3rem; border: 4px solid #f1f5f9; border-top-color: #2563eb; border-radius: 50%;" class="animate-spin"></div>
                <p style="margin-top: 1.5rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px;">Authenticating Financial Records...</p>
            </div>

            <!-- ERROR STATE -->
            <div *ngIf="error" style="background: white; border: 1px solid #fee2e2; border-radius: 2.5rem; padding: 4rem; text-align: center; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05);">
                <div style="width: 4rem; height: 4rem; background: #fee2e2; border-radius: 1.25rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: #dc2626;">
                    <lucide-icon name="alert-circle" [size]="32"></lucide-icon>
                </div>
                <h3 style="font-size: 1.5rem; font-weight: 800; color: #1e293b;">Data Sync Interrupted</h3>
                <p style="color: #64748b; margin-bottom: 2.5rem;">{{error}}</p>
                <button (click)="loadData()" 
                    style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 1rem; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s;"
                    onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    Retry Connection
                </button>
            </div>

            <div *ngIf="!loading && !error">
                <!-- Stats Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    
                    <div style="background: linear-gradient(135deg, #1d4ed8, #2563eb); border-radius: 2rem; padding: 2.5rem; color: white; box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.3); position: relative; overflow: hidden;">
                        <lucide-icon name="credit-card" style="position: absolute; bottom: -20px; right: -20px; width: 140px; height: 140px; color: rgba(255,255,255,0.1);"></lucide-icon>
                        <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem;">Volume of Transactions</p>
                        <h4 style="font-size: 3rem; font-weight: 900; letter-spacing: -0.04em;">{{payments.length}}</h4>
                    </div>

                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 2rem; padding: 2.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);">
                        <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 0.5rem;">Billing Histories</p>
                        <h4 style="font-size: 3rem; font-weight: 900; letter-spacing: -0.04em; color: #0f172a;">{{paymentHistories.length}}</h4>
                    </div>

                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 2rem; padding: 2.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);">
                        <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 0.5rem;">Capital Invested</p>
                        <div style="display: flex; align-items: baseline; gap: 8px;">
                            <h4 style="font-size: 3rem; font-weight: 900; letter-spacing: -0.04em; color: #2563eb;">{{totalAmount.toFixed(2)}}</h4>
                            <span style="font-size: 1.25rem; font-weight: 700; color: #94a3b8;">DT</span>
                        </div>
                    </div>
                </div>

                <!-- Create Section -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 3rem;">
                    
                    <!-- New Payment Form -->
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 2rem; padding: 2.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);">
                        <h3 style="font-size: 1.25rem; font-weight: 900; color: #0f172a; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 12px;">
                            <lucide-icon name="plus" [size]="20" style="color: #2563eb;"></lucide-icon>
                            Authorize Transaction
                        </h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                            <div>
                                <label style="display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.5rem;">Execution Date</label>
                                <input type="date" [(ngModel)]="newPayment.paymentDate" 
                                    style="width: 100%; height: 3.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0 1rem; font-size: 14px; font-weight: 600; color: #1e293b; outline: none; transition: border-color 0.2s;"
                                    onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#e2e8f0'" />
                            </div>
                            <div>
                                <label style="display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.5rem;">Payment Gateway</label>
                                <select [(ngModel)]="newPayment.paymentMethod" 
                                    style="width: 100%; height: 3.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0 1rem; font-size: 14px; font-weight: 600; color: #1e293b; outline: none; cursor: pointer;">
                                    <option value="CASH">Liquid Assets (Cash)</option>
                                    <option value="BANK">Wire Transfer</option>
                                    <option value="CREDIT_CARD">Credit Terminal</option>
                                    <option value="DEBIT_CARD">Direct Debit</option>
                                </select>
                            </div>
                        </div>
                        <button (click)="createPayment()" 
                            style="width: 100%; height: 4rem; background: #0f172a; color: white; border: none; border-radius: 1.25rem; font-size: 15px; font-weight: 800; cursor: pointer; transition: all 0.2s;"
                            onmouseover="this.style.background='#1e293b'; this.style.transform='translateY(-2px)'" 
                            onmouseout="this.style.background='#0f172a'; this.style.transform='translateY(0)'">
                            Execute Payment Request
                        </button>
                    </div>

                    <!-- New History Form -->
                    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 2rem; padding: 2.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); display: flex; flex-direction: column;">
                        <h3 style="font-size: 1.25rem; font-weight: 900; color: #0f172a; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 12px;">
                            <lucide-icon name="history" [size]="20" style="color: #2563eb;"></lucide-icon>
                            Open Billing Registry
                        </h3>
                        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 1rem;">
                            <div *ngIf="!showCreateHistory" style="text-align: center; padding: 1rem;">
                                <p style="font-size: 14px; color: #64748b; margin-bottom: 1.5rem;">Group individual payments into a secure audit registry.</p>
                                <button (click)="showCreateHistory = true" 
                                    style="background: #f1f5f9; color: #334155; padding: 12px 24px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; transition: all 0.2s;"
                                    onmouseover="this.style.background='#e2e8f0'">
                                    + Initialize Registry
                                </button>
                            </div>
                            <div *ngIf="showCreateHistory">
                                <label style="display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.5rem;">Baseline Capital (DT)</label>
                                <div style="display: flex; gap: 12px;">
                                    <input type="number" [(ngModel)]="newHistoryAmount" 
                                        style="flex: 1; height: 3.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0 1rem; font-size: 16px; font-weight: 900; color: #1e293b; outline: none;"
                                        placeholder="0.00" />
                                    <button (click)="createPaymentHistory()" 
                                        style="background: #10b981; color: white; padding: 0 24px; border-radius: 12px; border: none; font-weight: 800; cursor: pointer;">
                                        Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- History Lists -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;">
                    
                    <!-- Recent Payments -->
                    <div>
                        <h3 style="font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 1.5rem; padding-left: 0.5rem;">Recent Transactions</h3>
                        <div *ngIf="payments.length === 0" style="background: white; border: 2px dashed #e2e8f0; border-radius: 2rem; padding: 4rem; text-align: center; color: #94a3b8;">
                            No transactions validated.
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div *ngFor="let payment of payments" 
                                style="background: white; border: 1px solid #e2e8f0; border-radius: 1.5rem; padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s;"
                                onmouseover="this.style.borderColor='#cbd5e1'; this.style.transform='translateX(4px)'" 
                                onmouseout="this.style.borderColor='#e2e8f0'; this.style.transform='translateX(0)'">
                                <div style="display: flex; align-items: center; gap: 16px;">
                                    <div style="width: 48px; height: 48px; background: #f8fafc; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #2563eb;">
                                        <lucide-icon name="credit-card" [size]="20"></lucide-icon>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 14px; font-weight: 900; color: #0f172a; margin-bottom: 2px;">#TRX-{{payment.paymentId}}</h5>
                                        <p style="font-size: 12px; font-weight: 600; color: #94a3b8;">{{payment.paymentDate}}</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 7px; border: 1px solid #dbeafe;">{{payment.paymentMethod}}</span>
                                    <button (click)="deletePayment(payment.paymentId)" 
                                        style="width: 36px; height: 36px; background: transparent; border: none; color: #cbd5e1; cursor: pointer; transition: color 0.2s;"
                                        onmouseover="this.style.color='#ef4444'">
                                        <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Histories -->
                    <div>
                        <h3 style="font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 1.5rem; padding-left: 0.5rem;">Audit Registries</h3>
                        <div *ngIf="paymentHistories.length === 0" style="background: white; border: 2px dashed #e2e8f0; border-radius: 2rem; padding: 4rem; text-align: center; color: #94a3b8;">
                            Registry is currently empty.
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div *ngFor="let history of paymentHistories" 
                                style="background: white; border: 1px solid #e2e8f0; border-radius: 1.5rem; padding: 1.5rem; display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center; gap: 16px;">
                                    <div style="width: 48px; height: 48px; background: #ecfdf5; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #10b981;">
                                        <lucide-icon name="clipboard-check" [size]="20"></lucide-icon>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 14px; font-weight: 900; color: #0f172a; margin-bottom: 2px;">Registry #{{history.historyId}}</h5>
                                        <p style="font-size: 12px; font-weight: 600; color: #94a3b8;">{{history.paymentIds.length || 0}} Transactions Linked</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 16px;">
                                    <div style="text-align: right;">
                                        <span style="font-size: 1.25rem; font-weight: 950; color: #0f172a;">{{history.amount.toFixed(2)}}</span>
                                        <span style="font-size: 11px; font-weight: 700; color: #94a3b8; margin-left: 4px;">DT</span>
                                    </div>
                                    <button (click)="deletePaymentHistory(history.historyId)" 
                                        style="width: 36px; height: 36px; background: transparent; border: none; color: #cbd5e1; cursor: pointer; transition: color 0.2s;"
                                        onmouseover="this.style.color='#ef4444'">
                                        <lucide-icon name="trash-2" [size]="16"></lucide-icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
  `
})
export class PaymentComponent implements OnInit {
  payments: PaymentResponse[] = [];
  paymentHistories: PaymentHistoryResponse[] = [];
  loading = true;
  error = '';
  totalAmount = 0;
  showCreateHistory = false;
  newHistoryAmount = 0;

  newPayment = {
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH'
  };

  constructor(
    private paymentService: PaymentService,
    private paymentHistoryService: PaymentHistoryService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = '';

    this.paymentService.getAll().subscribe({
      next: (data) => {
        this.payments = data;
        this.loadHistories();
      },
      error: (err) => {
        this.error = 'Failed to load payments. Make sure the backend is running.';
        this.loading = false;
        console.error('Error loading payments:', err);
      }
    });
  }

  loadHistories() {
    this.paymentHistoryService.getAll().subscribe({
      next: (data) => {
        this.paymentHistories = data;
        this.totalAmount = data.reduce((sum, h) => sum + h.amount, 0);
        this.loading = false;
      },
      error: (err) => {
        this.paymentHistories = [];
        this.totalAmount = 0;
        this.loading = false;
        console.error('Error loading payment histories:', err);
      }
    });
  }

  createPayment() {
    const request = {
      paymentDate: this.newPayment.paymentDate,
      paymentMethod: this.newPayment.paymentMethod,
      paymentHistoryId: this.paymentHistories.length > 0 ? this.paymentHistories[0].historyId : 1,
      userId: 1
    };

    this.paymentService.create(request).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => console.error('Error creating payment:', err)
    });
  }

  deletePayment(id: number) {
    if (confirm('Are you sure you want to delete this payment?')) {
      this.paymentService.delete(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting payment:', err)
      });
    }
  }

  createPaymentHistory() {
    this.paymentHistoryService.create({ amount: this.newHistoryAmount }).subscribe({
      next: () => {
        this.newHistoryAmount = 0;
        this.showCreateHistory = false;
        this.loadData();
      },
      error: (err) => console.error('Error creating payment history:', err)
    });
  }

  deletePaymentHistory(id: number) {
    if (confirm('Are you sure you want to delete this payment history?')) {
      this.paymentHistoryService.delete(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error deleting payment history:', err)
      });
    }
  }
}
