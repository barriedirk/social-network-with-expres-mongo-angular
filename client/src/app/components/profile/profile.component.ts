import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { Follow } from '../../models/follow';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'profile',
    templateUrl: 'profile.component.html',
    providers: [UserService, FollowService],
})
export class ProfileComponent implements OnInit {
    public title: string;
    public user: User;
    public status: string;
    public identity: User;
    public token;
    public stats;
    public url: string;
    public followed;
    public following;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _followService: FollowService
    ) {
        this.title = 'Profile';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = environment.url;
        this.followed = false;
        this.following = false;
    }

    ngOnInit() {
        console.log('[ Profile component ] ::: ');

        this.loadPage();
    }

    loadPage() {
        this._route.params.subscribe((params) => {
            const id = params['id'];

            this.getUser(id);
            this.getCounters(id);
        });
    }

    getUser(id: string) {
        this._userService.getUser(id).subscribe(
            (response) => {
                if (response.user) {
                    console.log('getUser :::', response);
                    this.user = response.user;

                    if (response.following && response.following._id) {
                        this.following = true;
                    } else {
                        this.following = false;
                    }

                    if (response.followed && response.followed._id) {
                        this.followed = true;
                    } else {
                        this.followed = false;
                    }


                } else {
                    this.status = 'error';
                }
            },
            (error) => {
                console.log('error ', error);
                this._router.navigate(['/profile', this.identity._id]);
            }
        );
    }

    getCounters(id: string) {
        this._userService.getCounters(id).subscribe(
            (response) => {
                console.log('getCounters :::', response);
                this.stats = response;

            },
            (error) => {
                console.log('error :::', error);
            }
        );
    }

    followUser(followed) {
        const follow = new Follow('', this.identity._id, followed);

        this._followService.addFollow(this.token, follow).subscribe(
            response => {
                this.following = true;
            },
            error => {
                console.log('error :::', error);
            }
        )
    }

    unfollowUser(followed) {
        this._followService.deleteFollow(this.token, followed).subscribe(
            response => {
                this.following = false;
            },
            error => {
                console.log('error :::', error);
            }
        )
    }

    public followUserOver: string;
    mouseEnter(userId: string) {
        this.followUserOver = userId;
    }

    mouseLeave(userId: string) {
        this.followUserOver = '';
    }
}
