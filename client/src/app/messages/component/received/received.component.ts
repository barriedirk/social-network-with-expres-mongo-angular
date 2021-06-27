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
    selector: 'received',
    templateUrl: 'received.component.html',
    providers: [FollowService, MessageService]
})
export class ReceivedComponent implements OnInit {
    public title: string;
    public message: Message;
    public identity: User;
    public token;
    public url: string;
    public status: string;
    public follows;
    public messages: Message[];
    public pages;
    public total;
    public nextPage;
    public prevPage;
    public page: number;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _followService: FollowService,
        private _messageService: MessageService,
        private _userService: UserService
    ) {
        this.title = 'Messages received';
        this.url = environment.url;
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
    }

    ngOnInit() {
        console.log('[ received.component loading ] ::: ');
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

            this.getMessages(this.token, page);
        });
    }

    getMessages(token: string, page: number) {
        this._messageService.getMyMessages(token, page).subscribe(
            (response) => {
                console.log('[ getMessages response ] ::: ', response);

                if (response.messages) {
                    this.messages = response.messages;

                    this.total = response.total;
                    this.pages = response.pages;

                    if (page > this.pages) {
                        this._router.navigate(['/messages/received', 1]);
                    }

                }
            },
            (error) => {
                this.status = 'error';
                console.log('[ error ] ::: ', error);
            }
        );
    }

}
