import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payroll.html',
  styleUrls: ['./payroll.css']
})
export class Payroll implements OnInit {

  payrolls: any[] = [];
  employees: any[] = [];
  showForm = false;
  loading = false;
  message = '';
  messageType = '';

  form = {
    employeeId: '',
    month: '',
    year: new Date().getFullYear(),
    otherDeduction: 0
  };

  months = [
    { value: 1,  label: 'January' },
    { value: 2,  label: 'February' },
    { value: 3,  label: 'March' },
    { value: 4,  label: 'April' },
    { value: 5,  label: 'May' },
    { value: 6,  label: 'June' },
    { value: 7,  label: 'July' },
    { value: 8,  label: 'August' },
    { value: 9,  label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  private baseUrl = 'http://localhost:9090/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loadPayrolls();
      this.loadEmployees();
    }, 100);
  }

  loadPayrolls(): void {
    this.http.get<any[]>(`${this.baseUrl}/payroll`).subscribe({
      next: (data) => {
        this.payrolls = data;
        this.cdr.detectChanges();
      },
      error: () => this.showMessage('Failed to load payrolls', 'error')
    });
  }

  loadEmployees(): void {
    this.http.get<any[]>(`${this.baseUrl}/employees`).subscribe({
      next: (data) => this.employees = data,
      error: () => {}
    });
  }

  generatePayroll(): void {
    if (!this.form.employeeId || !this.form.month || !this.form.year) {
      this.showMessage('Please fill all required fields!', 'error');
      return;
    }

    this.loading = true;
    this.http.post(`${this.baseUrl}/payroll/generate`, this.form).subscribe({
      next: () => {
        this.showMessage('Payroll generated successfully!', 'success');
        this.loadPayrolls();
        this.showForm = false;
        this.loading = false;
        this.resetForm();
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Failed to generate payroll!', 'error');
        this.loading = false;
      }
    });
  }

  getMonthName(month: number): string {
    return this.months.find(m => m.value === month)?.label || '';
  }

  showMessage(msg: string, type: string): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 3000);
  }

  resetForm(): void {
    this.form = {
      employeeId: '',
      month: '',
      year: new Date().getFullYear(),
      otherDeduction: 0
    };
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
  }
}