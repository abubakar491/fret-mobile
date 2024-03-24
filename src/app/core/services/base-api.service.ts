import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  constructor(private httpClient: HttpClient) { }

  /**
   * GET HTTP method handler.
   * @param endpoint - API endpoint.
   * @param params - The query parameters.
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    return this.httpClient.get<T>(environment.apiURL + endpoint, { params });
  }

  /**
   * POST HTTP method handler.
   * @param endpoint - API endpoint.
   * @param payload - The request body.
   */
  post<T>(endpoint: string, payload?: any, params?: any): Observable<T> {
    console.log('payload', payload);
    return this.httpClient.post<T>(environment.apiURL + endpoint, payload, { params });
  }

  /**
   * POST HTTP method handler.
   * @param endpoint - API endpoint.
   * @param payload - The request body.
   */
  patch<T>(endpoint: string, payload: any, params?: any): Observable<T> {
    return this.httpClient.patch<T>(environment.apiURL + endpoint, payload, { params });
  }
}
