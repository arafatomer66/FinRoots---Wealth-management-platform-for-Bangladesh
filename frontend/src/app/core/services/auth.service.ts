import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs';

interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  religion?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);

  user = this.currentUser.asReadonly();
  isLoggedIn = computed(() => !!this.token());

  constructor(private http: HttpClient, private router: Router) {
    const savedToken = localStorage.getItem('finroots_token');
    const savedUser = localStorage.getItem('finroots_user');
    if (savedToken && savedUser) {
      this.token.set(savedToken);
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  register(data: { email: string; password: string; name: string; phone?: string }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data).pipe(
      tap(res => this.setSession(res)),
    );
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => this.setSession(res)),
    );
  }

  logout() {
    localStorage.removeItem('finroots_token');
    localStorage.removeItem('finroots_user');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.token();
  }

  refreshUser() {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('finroots_user', JSON.stringify(user));
      }),
    );
  }

  private setSession(res: AuthResponse) {
    this.token.set(res.token);
    this.currentUser.set(res.user);
    localStorage.setItem('finroots_token', res.token);
    localStorage.setItem('finroots_user', JSON.stringify(res.user));
  }
}
