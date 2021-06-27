import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { environment } from 'src/environments/environment';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'login',
    templateUrl: 'login.component.html',
    providers: [UserService],
})
export class LoginComponent implements OnInit {
    public title: string;
    public user: User;
    public status: string;
    public identity: User;
    public token: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService
    ) {
        this.title = 'Identify yourself';
        this.user = new User('', '', '', '', '', '', 'ROLE_USER', '');
    }

    ngOnInit() {
        console.log('[ Login Component ] ::: ');
    }

    onSubmit(form: NgForm) {
        console.log('[ this.user ] ::: ', this.user);
        this._userService.signup(this.user).subscribe(
            (response) => {
                this.identity = response.user;

                if (!this.identity || !this.identity._id) {
                    this.status = 'error';
                } else {
                    localStorage.setItem(
                        environment.keyIdentity,
                        JSON.stringify(this.identity)
                    );

                    this.getToken();
                }
            },
            (error) => {
                let errorMessage = <any>error;

                console.log('[ errorMessage ] ::: ', errorMessage);

                if (errorMessage !== null) {
                    this.status = 'error';
                }
            }
        );
    }

    getToken() {
        this._userService.signup(this.user, true).subscribe(
            (response) => {
                this.token = response.token;

                if (this.token.length <= 0) {
                    this.status = 'error';
                } else {
                    localStorage.setItem(environment.keyToken, this.token);

                    this.getCounters();
                }
            },
            (error) => {
                let errorMessage = <any>error;

                if (errorMessage !== null) {
                    this.status = 'error';
                }
            }
        );
    }

    getCounters() {
        this._userService.getCounters().subscribe(
            (response) => {
                console.log('[ response ] ::: ', response.response);
                localStorage.setItem(
                    environment.keyStats,
                    JSON.stringify(response)
                );
                this.status = 'succes';
                this._router.navigate(['/']);
            },
            (error) => {
                console.log('[ error ] ::: ', error);
            }
        );
    }
}
