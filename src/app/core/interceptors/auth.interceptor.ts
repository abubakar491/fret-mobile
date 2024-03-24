import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

import { environment } from "../../../environments/environment";
import { AuthService } from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }

  /**
   * Add `Authorization` to requests headers.
   * @param req - The request to handle.
   * @param next - The next chaining.
   * @returns `HttpEvent` observable.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.endsWith(environment.user.auth) && !req.url.startsWith('https://files.freterium.com')) {
      return this.authService.getToken().pipe(
        switchMap(token => next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })))
      );
    }

    return next.handle(req);
  }
}
