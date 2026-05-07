import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Don't add token for Daily.co API calls
  if (req.url.includes('daily.co')) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  if (token) {
    return next(req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) }));
  }
  return next(req);
};