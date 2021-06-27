import { Component, DoCheck, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { environment } from 'src/environments/environment';
import { User } from './models/user';
import { UserService } from './services/user.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [UserService],
})
export class AppComponent implements OnInit, DoCheck {
    public title: string = 'Ng Social';
    public identity: User;
    public url: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService
    ) {
        this.title = 'Ng Social';
        this.url = environment.url;
    }

    ngOnInit() {
        this.identity = this._userService.getIdentity();
    }

    ngDoCheck() {
        this.identity = this._userService.getIdentity();
    }

    logout() {
        localStorage.clear();
        this.identity = null;
        this._router.navigate(['/']);
    }
}
