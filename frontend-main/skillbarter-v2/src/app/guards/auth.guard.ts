import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!localStorage.getItem('token')) {
    router.navigate(['/login']);
    return false;
  }

  if (auth.currentUser?.userId) return true;

  return auth.resolveAndStoreCurrentUser().pipe(
    map(() => true),
    catchError(() => {
      auth.logout();
      return of(false);
    })
  );
};
