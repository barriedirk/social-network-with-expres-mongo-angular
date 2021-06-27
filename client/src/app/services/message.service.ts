import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Message } from '../models/message';

@Injectable()
export class MessageService {
    public url: string;

    constructor(private _http: HttpClient) {
        this.url = environment.url;
    }

    addMessage(token: string, message: Message): Observable<any> {
        let params = JSON.stringify(message);
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', token);

        return this._http.post(`${this.url}message`, params, { headers });
    }

    getMyMessages(token: string, page: number = 1): Observable<any> {
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', token);

        return this._http.get(`${this.url}my-messages/${page}`, { headers });
    }

    getEmmitMessages(token: string, page: number = 1): Observable<any> {
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', token);

        return this._http.get(`${this.url}messages/${page}`, { headers });
    }
}
