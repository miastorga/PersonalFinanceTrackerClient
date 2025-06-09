import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

interface LoginResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5022';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  login(credentials: LoginRequest): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('tokenType', response.tokenType);

            const expirationDate = new Date();
            expirationDate.setSeconds(expirationDate.getSeconds() + response.expiresIn);
            localStorage.setItem('tokenExpiration', expirationDate.toISOString());

            console.log(response)
            this.isAuthenticatedSubject.next(true);
            return true;
          }
          return false;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('tokenExpiration');
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isTokenExpired(): boolean {
    const expiration = localStorage.getItem('tokenExpiration');
    if (!expiration) return true;
    return new Date() > new Date(expiration);
  }

  private checkAuthStatus(): void {
    const token = this.getToken();
    const isExpired = this.isTokenExpired();
    this.isAuthenticatedSubject.next(!!token && !isExpired);
  }
}
