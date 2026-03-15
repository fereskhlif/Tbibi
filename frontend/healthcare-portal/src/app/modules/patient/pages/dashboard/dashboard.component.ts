import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-patient-dashboard',
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
    stats = [
        { icon: '📅', title: 'Next Appointment', value: 'Tomorrow, 10:00 AM', subtitle: 'Dr. Sarah Johnson' },
        { icon: '💊', title: 'Pending Medications', value: '3 medications', subtitle: '1 refill needed' },
        { icon: '🔬', title: 'Lab Results', value: '2 new results', subtitle: 'Blood work completed' },
        { icon: '📋', title: 'Health Score', value: '85/100', subtitle: 'Good condition' }
    ];

    actions = [
      { icon: '📅', title: 'Appointments', description: 'Schedule your consultations', route: 'appointments' },
      { icon: '📋', title: 'Medical Records', description: 'View your health records & imaging', route: 'medical-records' },
      { icon: '💊', title: 'Prescriptions', description: 'View your prescriptions', route: 'prescriptions' },
      { icon: '🔬', title: 'Lab Results', description: 'Check your lab results', route: 'lab-results' },
      { icon: '🛍️', title: 'Pharmacy Shop', description: 'Order medications online', route: 'pharmacy-shop' },
      { icon: '💬', title: 'AI Health Assistant', description: 'Chat with our AI assistant', route: 'ai-chat' }
    ];

    recentActivity = [
        { icon: '📅', title: 'Appointment Confirmed', description: 'Video consultation with Dr. Sarah Johnson', time: '2 hours ago' },
        { icon: '💊', title: 'Prescription Updated', description: 'Medication dosage adjusted by Dr. Ahmed', time: '5 hours ago' },
        { icon: '🔬', title: 'Lab Results Available', description: 'Complete blood count results ready', time: '1 day ago' },
        { icon: '💬', title: 'AI Consultation', description: 'Symptom analysis completed', time: '2 days ago' },
        { icon: '💳', title: 'Payment Confirmed', description: 'Consultation fee processed', time: '3 days ago' }
    ];

    constructor(private router: Router) { }

    navigate(route: string) {
        this.router.navigate(['/patient', route]);
    }
}
