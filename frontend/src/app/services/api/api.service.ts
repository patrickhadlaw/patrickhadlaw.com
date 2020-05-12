import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ContactMeRequest } from '../../model/api.model';
import { Observable } from 'rxjs';

@Injectable()
export class ApiService {

  constructor(private http: HttpClient) {}

  public contactMe(request: ContactMeRequest): Observable<null> {
    return this.http.post<null>('/api/message/send', request);
  }
}
