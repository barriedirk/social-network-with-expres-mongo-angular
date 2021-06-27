import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { User } from 'src/app/models/user';
import { environment } from 'src/environments/environment';
import { UserService } from '../../services/user.service';
import { PublicationService } from '../../services/publication.service';
import { Publication } from '../../models/publication';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgForm } from '@angular/forms';
import { UploadService } from '../../services/upload.service';

@Component({
    selector: 'sidebar',
    templateUrl: 'sidebar.component.html',
    providers: [UserService, PublicationService, UploadService],
})
export class SidebarComponent implements OnInit {
    public identity: User;
    public token: string;
    public stats;
    public url: string;
    public status: string;
    public publication: Publication;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _uploadService: UploadService,
        private _userService: UserService,
        private _publicationService: PublicationService
    ) {
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.stats = this._userService.getStats();
        this.url = environment.url;
        this.publication = new Publication('', '', '', '', this.identity._id);
    }

    ngOnInit() {
        console.log('[ sidebar component loaded ] ::: ');
    }

    onSubmit(form: NgForm, event) {
        this._publicationService
            .addPublication(this.token, this.publication)
            .subscribe(
                (response) => {
                    if (response.publication) {
                        if (this.filesToUpload && this.filesToUpload.length) {
                            this._uploadService
                                .makeFileRequest(
                                    `upload-image-pub/${response.publication._id}`,
                                    [],
                                    this.filesToUpload,
                                    this.token,
                                    'image'
                                )
                                .then((result: any) => {
                                    this.publication.file = result.image;

                                    this.status = 'success';
                                    form.reset();
                                    this._router.navigate(['/timeline']);
                                    this.sended.emit({ send: 'true' });
                                });
                        } else {
                            this.status = 'success';
                            form.reset();
                            this._router.navigate(['/timeline']);
                            this.sended.emit({ send: 'true' });
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

    public filesToUpload: Array<File>;
    fileChangeEvent(fileInput: any) {
        this.filesToUpload = <Array<File>>fileInput.target.files;
    }

    @Output() sended = new EventEmitter();
    sendPublication(event) {
        console.log('[ sendPublication event ] ::: ', event);
        this.sended.emit({ send: 'true' });
    }
}
