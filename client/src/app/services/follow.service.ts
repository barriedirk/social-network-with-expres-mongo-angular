import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { Follow } from '../models/follow';
import { environment } from '../../environments/environment';

@Injectable()
export class FollowService {
    public url: string;

    constructor(private _http: HttpClient) {
        this.url = environment.url;
    }

    addFollow(token: string, follow: Follow): Observable<any> {
        let params = JSON.stringify(follow);
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', token);

        return this._http.post(`${this.url}follow`, params, {
            headers: headers,
        });
    }

    deleteFollow(token: string, id: string): Observable<any> {
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', token);

        return this._http.delete(`${this.url}follow/${id}`, {
            headers: headers,
        });
    }

    getFollowing(
        token: string,
        userId: string,
        page: number = 1
    ): Observable<any> {
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', token);
        let url = `${this.url}following`;

        if (userId !== null) {
            url = `${this.url}following/${userId}/${page}`;
        }

        return this._http.get(url, { headers });
    }

    getFollowed(
        token: string,
        userId: string,
        page: number = 1
    ): Observable<any> {
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', token);
        let url = `${this.url}followed`;

        if (userId !== null) {
            url = `${this.url}followed/${userId}/${page}`;
        }

        return this._http.get(url, { headers });
    }

    getMyFollows(token: string): Observable<any> {
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', token);

        return this._http.get(`${this.url}get-my-follows/true`, { headers });
    }
}
