import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee.html',
  styleUrls: ['./employee.css']
})
export class Employee implements OnInit {

  employees: any[] = [];
  departments: any[] = [];
  showForm = false;
  isEditing = false;
  loading = false;
  message = '';
  messageType = '';

  form = {
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    hireDate: '',
    salary: '',
    departmentId: ''
  };

  private baseUrl = 'http://localhost:9090/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
  }

  loadEmployees(): void {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any[]>(`${this.baseUrl}/employees`, { headers }).subscribe({
      next: (data) => {
        this.employees = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error:', err);
        this.showMessage('Failed to load employees', 'error');
      }
    });
  }

  loadDepartments(): void {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any[]>(`${this.baseUrl}/departments`, { headers }).subscribe({
      next: (data) => {
        this.departments = [...data];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  openAddForm(): void {
    this.isEditing = false;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(emp: any): void {
    this.isEditing = true;
    this.form = {
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      hireDate: emp.hireDate,
      salary: emp.salary,
      departmentId: emp.departmentId
    };
    this.showForm = true;
  }

  saveEmployee(): void {
    if (!this.form.firstName || !this.form.lastName ||
        !this.form.email || !this.form.salary || !this.form.departmentId) {
      this.showMessage('Please fill all required fields!', 'error');
      return;
    }

    this.loading = true;
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    if (this.isEditing) {
      this.http.put(`${this.baseUrl}/employees/${this.form.id}`, this.form, { headers })
        .subscribe({
          next: () => {
            this.showMessage('Employee updated successfully!', 'success');
            this.loadEmployees();
            this.showForm = false;
            this.loading = false;
          },
          error: () => {
            this.showMessage('Failed to update employee!', 'error');
            this.loading = false;
          }
        });
    } else {
      this.http.post(`${this.baseUrl}/employees`, this.form, { headers })
        .subscribe({
          next: () => {
            this.showMessage('Employee added successfully!', 'success');
            this.loadEmployees();
            this.showForm = false;
            this.loading = false;
          },
          error: (err) => {
            this.showMessage(err.error?.message || 'Failed to add employee!', 'error');
            this.loading = false;
          }
        });
    }
  }

  deactivateEmployee(id: number): void {
    if (!confirm('Are you sure you want to deactivate this employee?')) return;

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.delete(`${this.baseUrl}/employees/${id}`, { headers }).subscribe({
      next: () => {
        this.showMessage('Employee deactivated!', 'success');
        this.loadEmployees();
      },
      error: () => this.showMessage('Failed to deactivate!', 'error')
    });
  }

  showMessage(msg: string, type: string): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 3000);
  }

  resetForm(): void {
    this.form = {
      id: null,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      hireDate: '',
      salary: '',
      departmentId: ''
    };
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
  }
}