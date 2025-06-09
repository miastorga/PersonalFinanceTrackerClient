import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuthStatus(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(childRoute, state);
  }

  private checkAuthStatus(url: string): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (isAuthenticated && !this.authService.isTokenExpired()) {
          return true;
        } else {
          // Guardar la URL a la que quería acceder para redirigir después del login
          localStorage.setItem('redirectUrl', url);
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
