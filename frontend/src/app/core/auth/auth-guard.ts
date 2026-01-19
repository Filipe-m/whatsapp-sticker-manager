import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.getSession().pipe(
    map((ok) => {
      if (!ok) {
        router.navigateByUrl('/');
        return false;
      }
      return true;
    }),
    catchError(() => {
      router.navigateByUrl('/');
      return of(false);
    }),
  );
};
