import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';

import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/empty';

import { environment } from '../../../environments/environment';
import { STATUS, STATUS_ICONS } from '../../constants/global.constant'


import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { UserProvider } from '../user/user';


@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {
    user: any;
    private refreshTokenInProgress = false;

    // Refresh Token Subject tracks the current token, or is null if no token is currently
    // available (e.g. refresh pending).
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
        null
    );
    constructor(private userProvider: UserProvider) {


    }

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {

        return <any>next.handle(request).pipe(catchError(err => {

            console.log("Refresh Intercepting")
            if (request.url.includes(environment.apiURL)) {
                // We don't want to refresh token for some requests like login or refresh token itself
                // So we verify url and we throw an error if it's the case

                if (
                    request.url.includes("refresh-token") ||
                    request.url.includes("authentification")
                ) {
                    // We do another check to see if refresh token failed
                    // In this case we want to logout user and to redirect it to login page

                    if (request.url.includes("refresh-token")) {
                        //this.userProvider.logout();
                    }

                    return throwError(err);
                }

                // If error status is different than 401 we want to skip refresh token
                // So we check that and throw the error if it's the case
                if (err.status !== 401) {
                    return throwError(err);
                }

                if (this.refreshTokenInProgress) {
                    // If refreshTokenInProgress is true, we will wait until refreshTokenSubject has a non-null value
                    // – which means the new token is ready and we can retry the request again
                    return this.refreshTokenSubject
                        .pipe(
                            filter(result => result !== null),
                            take(1),
                            switchMap(token => {
                                return next.handle(this.addAuthenticationToken(token));
                            })
                        )
                } else {
                    this.refreshTokenInProgress = true;

                    // Set the refreshTokenSubject to null so that subsequent API calls will wait until the new token has been retrieved
                    this.refreshTokenSubject.next(null);

                    // Call auth.refreshAccessToken(this is an Observable that will be returned)
                    return this.userProvider
                        .refreshAccessToken()
                        .pipe(
                            switchMap(token => {
                                //When the call to refreshToken completes we reset the refreshTokenInProgress to false
                                // for the next time the token needs to be refreshed
                                //console.log("switchMaping");
                                this.refreshTokenInProgress = false;
                                this.refreshTokenSubject.next(token);
                                return next.handle(this.addAuthenticationToken(request));
                            })
                            , catchError(error => {
                                this.refreshTokenInProgress = false;

                                //this.userProvider.logout();
                                return throwError(error);
                            }));
                }
            }
        }));

    }
    addAuthenticationToken(req) {

        //this.user = this.authService.credentials;

        if (this.userProvider.isLoggedIn()) {

            //const token: string = JSON.parse(sessionStorage.getItem('credentials')).token.access_token;
            // this.userProvider.getData().then((data: any) => {
            //     if (data) {
            //         this.user = data;
            //       } 
            //   }).catch((err: any) => {
            //     console.log('Error User is not LoggedIn', err);
            //   });;

            console.log("this.userProvider._user in refresh", this.userProvider._user);
            let token: string = JSON.parse(this.userProvider._user.token).access_token;
            console.log("token", token);

            console.log('Authorization', token)
            req = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + token),
            });
        }


        // Get access token from Local Storage
        return req;
    }


}


