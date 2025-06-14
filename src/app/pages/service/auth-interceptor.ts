import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const token = authService.getToken();

  if (token && !authService.isTokenExpired()) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Request con Authorization header:',
      authReq.headers.get('Authorization')?.substring(0, 20) + '...');
    return next(authReq);
  }

  return next(req);
};
