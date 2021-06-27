import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { PublicationService } from 'src/app/services/publication.service';
import { environment } from 'src/environments/environment';
import { Publication } from '../../models/publication';

@Component({
    selector: 'timeline',
    templateUrl: 'timeline.component.html',
    providers: [UserService, PublicationService],
})
export class TimelineComponent implements OnInit {
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

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _publicationService: PublicationService
    ) {
        this.title = 'Timeline';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = environment.url;
        this.page = 1;
    }

    ngOnInit() {
        console.log('[ timeline component loaded ] ::: ');
        this.getPublications(this.page);
    }

    getPublications(page: number, adding: boolean = false) {
        this._publicationService.getPublications(this.token, page).subscribe(
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
                        console.log($);
                        console.log(jQuery);

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
        // if (this.publications.length >= this.total) {
        //     this.noMore = true;
        // } else {
        //     this.page += 1;
        //     this.getPublications(this.page, true);
        // }

        this.page += 1;
        if (this.page == this.pages) {
            this.noMore = true;
        }
        this.getPublications(this.page, true);
    }

    refresh(event = null) {
        this.getPublications(1);
    }

    showImage: string;
    showThisImage(id) {
        this.showImage = id;
    }
    hideThisImage(id) {
        this.showImage = '';
    }

    deletePublication(publicationId: string) {
        this._publicationService
            .deletePublication(this.token, publicationId)
            .subscribe(
                (response) => {
                    this.refresh();
                },
                (error) => {
                    console.log('error :::', error);
                }
            );
    }
}
