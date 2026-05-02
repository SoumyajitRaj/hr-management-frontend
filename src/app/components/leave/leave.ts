import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave.html',
  styleUrls: ['./leave.css']
})
export class Leave implements OnInit {

  leaves: any[] = [];
  employees: any[] = [];
  activeTab = 'all';
  showForm = false;
  loading = false;
  message = '';
  messageType = '';

  form = {
    employeeId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  };

  private baseUrl = 'http://localhost:9090/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loadLeaves();
      this.loadEmployees();
    }, 100);
  }

  loadLeaves(): void {
    const url = this.activeTab === 'pending'
      ? `${this.baseUrl}/leaves/pending`
      : `${this.baseUrl}/leaves`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.leaves = data;
        this.cdr.detectChanges();
      },
      error: () => this.showMessage('Failed to load leaves', 'error')
    });
  }

  loadEmployees(): void {
    this.http.get<any[]>(`${this.baseUrl}/employees`).subscribe({
      next: (data) => this.employees = data,
      error: () => {}
    });
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.loadLeaves();
  }

  applyLeave(): void {
    if (!this.form.employeeId || !this.form.leaveType ||
        !this.form.startDate || !this.form.endDate) {
      this.showMessage('Please fill all required fields!', 'error');
      return;
    }

    this.loading = true;
    this.http.post(`${this.baseUrl}/leaves/apply`, this.form).subscribe({
      next: () => {
        this.showMessage('Leave applied successfully!', 'success');
        this.loadLeaves();
        this.showForm = false;
        this.loading = false;
        this.resetForm();
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Failed to apply leave!', 'error');
        this.loading = false;
      }
    });
  }

  processLeave(leaveId: number, action: string): void {
    const remarks = action === 'APPROVED'
      ? 'Approved by admin'
      : 'Rejected by admin';

    this.http.put(`${this.baseUrl}/leaves/${leaveId}/process`, {
      action, remarks
    }).subscribe({
      next: () => {
        this.showMessage(`Leave ${action.toLowerCase()}!`, 'success');
        this.loadLeaves();
      },
      error: () => this.showMessage('Failed to process leave!', 'error')
    });
  }

  cancelLeave(leaveId: number): void {
    if (!confirm('Cancel this leave?')) return;

    this.http.put(`${this.baseUrl}/leaves/${leaveId}/cancel`, {}).subscribe({
      next: () => {
        this.showMessage('Leave cancelled!', 'success');
        this.loadLeaves();
      },
      error: () => this.showMessage('Failed to cancel!', 'error')
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'APPROVED':  return 'approved';
      case 'REJECTED':  return 'rejected';
      case 'CANCELLED': return 'cancelled';
      default:          return 'pending';
    }
  }

  showMessage(msg: string, type: string): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 3000);
  }

  resetForm(): void {
    this.form = {
      employeeId: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: ''
    };
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
  }
}