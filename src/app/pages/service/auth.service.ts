import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface LoginResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Root {
  type: string
  title: string
  status: number
  errors: Errors
}

export interface Errors {
  DuplicateUserName: string[]
  DuplicateEmail: string[]
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://financetrackerapi.happyisland-59300aa5.brazilsouth.azurecontainerapps.io';
  // private apiUrl = 'http://localhost:5022'

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  register(credentials: LoginRequest): Observable<boolean> {
    return this.http.post<LoginRequest>(`${this.apiUrl}/register`, credentials).pipe(
      map(() => true),
      catchError(error => {
        throw error
      })
    )
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
