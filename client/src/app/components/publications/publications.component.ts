
import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/models/user';
import { environment } from 'src/environments/environment';
import { UserService } from '../../services/user.service';
import { PublicationService } from '../../services/publication.service';
import { Publication } from '../../models/publication';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'publications',
    templateUrl: 'publications.component.html',
    providers: [UserService, PublicationService],
})
export class PublicationsComponent implements OnInit {
    public identity;
    public token;
    public title: string;
    public url: string;
    public status: string;
    public page: number;
    public pages: number;
    public total: number;
    public itemsPerPage: number;
    public publications: Publication[];

    @Input() userId: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _publicationService: PublicationService
    ) {
        this.title = 'Publications';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = environment.url;
        this.page = 1;
    }

    ngOnInit() {
        console.log('[ publications component loaded ] ::: ');

        console.log('[ this.userId ] ::: ', this.userId);
        this.getPublications(this.userId, this.page);
    }

    getPublications(userId: string, page: number, adding: boolean = false) {
        this._publicationService.getPublicationsUser(this.token, userId, page).subscribe(
            (response) => {
                console.log('[ response ] ::: ', response);
                if (response.publications) {
                    this.total = response.total;
                    this.pages = response.pages;
                    this.itemsPerPage = response.itemsPerPage;

                    if (!adding) {
                        this.publications = response.publications;
                    } else {
                        const arrayA = this.publications;
                        const arrayB = response.publications;

                        this.publications = arrayA.concat(arrayB);

                        // @todo need to fix
                        console.log( $);
                        console.log( jQuery );

                        $('html', 'body').animate(
                            {
                                scrollTop: $('html').prop('scrollHeight'),
                            },
                            500
                        );
                    }

                    if (page > this.pages) {
                        // this._router.navigate(['/home']);
                    }
                } else {
                    this.status = 'error';
                }
            },
            (error) => {
                console.log(error);
                if (error != null) {
                    this.status = 'error';
                }
            }
        );
    }

    public noMore: boolean = false;
    viewMore() {
        this.page += 1;

        // if (this.publications.length >= this.total) {
        if (this.page == this.total) {
            this.noMore = true;
        }
        this.getPublications(this.userId, this.page, true);
    }
}
