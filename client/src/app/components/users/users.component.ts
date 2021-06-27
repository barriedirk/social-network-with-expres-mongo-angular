import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Follow } from '../../models/follow';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';

@Component({
    selector: 'users',
    templateUrl: 'users.component.html',
    providers: [UserService, FollowService],
})
export class UsersComponent implements OnInit {
    public title: string;
    public identity: User;
    public token: string;
    public url: string;
    public page: number;
    public nextPage: number;
    public prevPage: number;
    public total: number;
    public pages: number;
    public users: User[];
    public follows;
    public status: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _followService: FollowService
    ) {
        this.title = 'People';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = environment.url;
    }

    ngOnInit() {
        console.log('[ user.component loaded ] ::: ');

        this.currentPage();
    }

    currentPage() {
        this._route.params.subscribe((params) => {
            let page = +params['page'];
            this.page = page;

            if (!params['page']) {
                page = 1;
            }

            if (!page) {
                page = 1;
            } else {
                this.nextPage = page + 1;
                this.prevPage = page - 1;

                if (this.prevPage <= 0) this.prevPage = 1;
            }
            this.getUsers(page);
        });
    }

    getUsers(page?: number) {
        this._userService.getUsers(page).subscribe(
            (response) => {
                if (!response.users) {
                    this.status = 'error';
                } else {
                    console.log('[ response.users ] ::: ', response.users);

                    this.total = response.total;
                    this.users = response.users;
                    this.pages = response.pages;
                    this.follows = response.users_following;

                    console.log('[ this.follows ] ::: ', this.follows);

                    if (page > this.pages) {
                        this._router.navigate(['/users', 1]);
                    }
                }
            },
            (error) => {
                console.log('[ error ] ::: ', error);

                if (error !== null) this.status = 'error';
            }
        );
    }

    public followUserOver;
    mouseEnter(userId: string) {
        this.followUserOver = userId;
    }

    mouseLeave(userId: string) {
        this.followUserOver = 0;
    }

    followUser(followed) {
        var follow = new Follow('', this.identity._id, followed);

        this._followService.addFollow(this.token, follow).subscribe(
            (response) => {
                if (!response) {
                    this.status = 'error';
                } else {
                    this.status = 'success';
                    this.follows.push(followed);
                }
            },
            (error) => {
                console.log('[ error ] ::: ', error);

                if (error !== null) this.status = 'error';
            }
        );
    }

    unfollowUser(followed) {
        this._followService.deleteFollow(this.token, followed).subscribe(
            response => {
                var search = this.follows.indexOf(followed);

                if (search !== -1) {
                    this.follows.splice(search, 1);
                }
            },
            error => {
                console.log('[ error ] ::: ', error);

                if (error !== null) this.status = 'error';
            }
        )

    }
}
