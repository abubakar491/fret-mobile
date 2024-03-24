import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Redirect to the login page if `authService.isAuthentificated` return false.
   * @returns Boolean observable.
   */
   canActivate(): Observable<boolean> | boolean {
    return this.authService.isAuthentificated().pipe(
      take(1),
      map(isAuthenticated => {
        console.log('isAuthenticated', isAuthenticated)
        if (isAuthenticated) {
          return true;
        }
        this.router.navigateByUrl('/login');
        return false;
      })
    );
  }
}
