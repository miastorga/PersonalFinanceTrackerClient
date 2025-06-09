import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  console.log('📡 Interceptor ejecutándose para:', req.url);

  const token = authService.getToken();
  console.log('🔐 Token encontrado:', token ? 'SÍ' : 'NO');
  console.log('⏰ Token expirado:', authService.isTokenExpired());

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

  console.log('❌ Request SIN Authorization header');
  return next(req);
};
