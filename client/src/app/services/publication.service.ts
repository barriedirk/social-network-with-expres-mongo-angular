import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { Follow } from '../models/follow';
import { Publication } from '../models/publication';
import { environment } from '../../environments/environment';

@Injectable()
export class PublicationService {
    public url: string;

    constructor(private _http: HttpClient) {
        this.url = environment.url;
    }

    addPublication(token: string, publication: Publication): Observable<any> {
        let params = JSON.stringify(publication);
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', token);

        return this._http.post<any>(`${this.url}publication`, params, {
            headers: headers,
        });
    }

    getPublications(token: string, page: number = 1): Observable<any> {
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', token);

        return this._http.get(`${this.url}publications/${page}`, {
            headers: headers,
        });
    }

    getPublicationsUser(token: string, userId: string, page: number = 1): Observable<any> {
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', token);

        return this._http.get(`${this.url}publications-user/${userId}/${page}`, {
            headers: headers,
        });
    }

    deletePublication(token: string, id: string): Observable<any> {
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', token);

        return this._http.delete(`${this.url}publication/${id}`, {
            headers: headers,
        });
    }
}
