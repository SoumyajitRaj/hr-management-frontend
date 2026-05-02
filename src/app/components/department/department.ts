import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './department.html',
  styleUrls: ['./department.css']
})
export class Department implements OnInit {

  departments: any[] = [];
  showForm = false;
  isEditing = false;
  loading = false;
  message = '';
  messageType = '';

  form = {
    id: null,
    name: '',
    description: ''
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
      this.loadDepartments();
    }, 100);
  }

  loadDepartments(): void {
    this.http.get<any[]>(`${this.baseUrl}/departments`).subscribe({
      next: (data) => {
        this.departments = data;
        this.cdr.detectChanges();
      },
      error: () => this.showMessage('Failed to load departments', 'error')
    });
  }

  openAddForm(): void {
    this.isEditing = false;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(dept: any): void {
    this.isEditing = true;
    this.form = {
      id: dept.id,
      name: dept.name,
      description: dept.description
    };
    this.showForm = true;
  }

  saveDepartment(): void {
    if (!this.form.name) {
      this.showMessage('Department name required!', 'error');
      return;
    }

    this.loading = true;

    if (this.isEditing) {
      this.http.put(`${this.baseUrl}/departments/${this.form.id}`, this.form)
        .subscribe({
          next: () => {
            this.showMessage('Department updated!', 'success');
            this.loadDepartments();
            this.showForm = false;
            this.loading = false;
          },
          error: () => {
            this.showMessage('Failed to update!', 'error');
            this.loading = false;
          }
        });
    } else {
      this.http.post(`${this.baseUrl}/departments`, this.form)
        .subscribe({
          next: () => {
            this.showMessage('Department added!', 'success');
            this.loadDepartments();
            this.showForm = false;
            this.loading = false;
          },
          error: (err) => {
            this.showMessage(err.error?.message || 'Failed to add!', 'error');
            this.loading = false;
          }
        });
    }
  }

  deleteDepartment(id: number): void {
    if (!confirm('Delete this department?')) return;

    this.http.delete(`${this.baseUrl}/departments/${id}`).subscribe({
      next: () => {
        this.showMessage('Department deleted!', 'success');
        this.loadDepartments();
      },
      error: () => this.showMessage('Failed to delete!', 'error')
    });
  }

  showMessage(msg: string, type: string): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 3000);
  }

  resetForm(): void {
    this.form = { id: null, name: '', description: '' };
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
  }
}