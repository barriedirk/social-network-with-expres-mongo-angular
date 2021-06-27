import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable()
export class UserService {
    public url: string;
    public identity: User;
    public token: string;
    public stats: any;

    constructor(public _http: HttpClient) {
        this.url = environment.url;
    }

    register(user: User): Observable<any> {
        const params = JSON.stringify(user);
        const headers = new HttpHeaders().set(
            'Content-Type',
            'application/json'
        );

        return this._http.post<any>(`${this.url}register`, params, {
            headers,
        });
    }

    signup(user: User, getToken: boolean = null): Observable<any> {
        if (getToken !== null) {
            user.gettoken = getToken;
        }

        let params = JSON.stringify(user);
        const headers = new HttpHeaders().set(
            'Content-Type',
            'application/json'
        );

        return this._http.post<any>(`${this.url}login`, params, {
            headers,
        });
    }

    getIdentity() {
        const identity: User = JSON.parse(
            localStorage.getItem(environment.keyIdentity)
        );

        if (typeof identity !== 'undefined' || typeof identity !== null) {
            this.identity = identity;
        } else {
            this.identity = null;
        }
        return this.identity;
    }

    getToken() {
        const token: string = localStorage.getItem(environment.keyToken);

        if (token != 'undefined') {
            this.token = token;
        } else {
            this.token = null;
        }

        return this.token;
    }

    getStats() {
        let stats = JSON.parse(localStorage.getItem(environment.keyStats));

        if (stats !== 'undefined') {
            this.stats = stats;
        } else {
            this.stats = null;
        }

        return stats;
    }

    getCounters(userId: string = null): Observable<any> {
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this.getToken());

        if (userId !== null) {
            return this._http.get(`${this.url}counters/${userId}`, { headers });
        } else {
            return this._http.get(`${this.url}counters/`, { headers });
        }
    }

    updateUser(user: User): Observable<any> {
        let params = JSON.stringify(user);
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this.getToken());

        return this._http.put(`${this.url}update-user/${user._id}`, params, {
            headers: headers,
        });
    }

    getUsers(page: number = null): Observable<any> {
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this.getToken());

        return this._http.get(`${this.url}users/${page}`, { headers });
    }

    getUser(id: string): Observable<any> {
        let headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', this.getToken());

        return this._http.get(`${this.url}user/${id}`, { headers });
    }
}
