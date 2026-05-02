import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  username = '';
  greeting = '';
  greetingIcon = '';

  today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  totalEmployees = 0;
  totalDepartments = 0;
  pendingLeaves = 0;
  totalPayrolls = 0;

  animatedEmployees = 0;
  animatedDepartments = 0;
  animatedLeaves = 0;
  animatedPayrolls = 0;

  recentEmployees: any[] = [];

  approvedLeaves = 0;
  rejectedLeaves = 0;
  cancelledLeaves = 0;

  private baseUrl = 'http://localhost:9090/api';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.username = this.authService.getUsername();
    this.setGreeting();
  }

  ngOnInit(): void {
    this.loadStats();
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning';
      this.greetingIcon = '🌅';
    } else if (hour < 17) {
      this.greeting = 'Good Afternoon';
      this.greetingIcon = '☀️';
    } else {
      this.greeting = 'Good Evening';
      this.greetingIcon = '🌙';
    }
  }

  animateCounter(target: number, property: string): void {
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      (this as any)[property] = current;
      this.cdr.detectChanges();
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
  }

  getPercent(value: number): number {
    const total = this.pendingLeaves + this.approvedLeaves +
                  this.rejectedLeaves + this.cancelledLeaves;
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  loadStats(): void {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any[]>(`${this.baseUrl}/employees`, { headers }).subscribe({
      next: (data) => {
        this.totalEmployees = data.length;
        this.recentEmployees = data.slice(0, 5);
        this.animateCounter(data.length, 'animatedEmployees');
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.http.get<any[]>(`${this.baseUrl}/departments`, { headers }).subscribe({
      next: (data) => {
        this.totalDepartments = data.length;
        this.animateCounter(data.length, 'animatedDepartments');
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.http.get<any[]>(`${this.baseUrl}/leaves`, { headers }).subscribe({
      next: (data) => {
        this.approvedLeaves  = data.filter(l => l.status === 'APPROVED').length;
        this.rejectedLeaves  = data.filter(l => l.status === 'REJECTED').length;
        this.cancelledLeaves = data.filter(l => l.status === 'CANCELLED').length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.http.get<any[]>(`${this.baseUrl}/leaves/pending`, { headers }).subscribe({
      next: (data) => {
        this.pendingLeaves = data.length;
        this.animateCounter(data.length, 'animatedLeaves');
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.http.get<any[]>(`${this.baseUrl}/payroll`, { headers }).subscribe({
      next: (data) => {
        this.totalPayrolls = data.length;
        this.animateCounter(data.length, 'animatedPayrolls');
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
  }
}