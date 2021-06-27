import { Component, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Message } from 'src/app/models/message';
import { MessageService } from '../../../services/message.service';
import { Follow } from 'src/app/models/follow';
import { FollowService } from '../../../services/follow.service';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/models/user';
import { UserService } from '../../../services/user.service';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'add',
    templateUrl: 'add.component.html',
    providers: [FollowService, MessageService],
})
export class AddComponent implements OnInit {
    public title: string;
    public message: Message;
    public identity: User;
    public token;
    public url: string;
    public status: string;
    public follows;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _followService: FollowService,
        private _messageService: MessageService,
        private _userService: UserService
    ) {
        this.title = 'Send messages';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = environment.url;
        this.message = new Message('', '', '', '', this.identity._id, '');
    }

    ngOnInit() {
        console.log('[ add.component loading ] ::: ');
        this.getMyFollows();
    }

    getMyFollows() {
        this._followService.getMyFollows(this.token).subscribe(
            (response) => {
                this.follows = response.follows;
            },
            (error) => {
                this.status = 'error';
                console.log('[ error ] ::: ', error);
            }
        );
    }

    onSubmit(form: NgForm) {
        console.log('[ this.message ] ::: ', this.message);
        this._messageService.addMessage(this.token, this.message).subscribe(
            (response) => {
                if (response.message) {
                    this.status = 'success';
                    form.reset();
                } else {

                }

            },
            (error) => {
                this.status = 'error';
                console.log('[ error ] ::: ', error);
            }
        );
    }
}
