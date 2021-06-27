import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { environment } from 'src/environments/environment';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { UploadService } from '../../services/upload.service';

@Component({
    selector: 'user-edit',
    templateUrl: 'user-edit.component.html',
    providers: [UserService, UploadService],
})
export class UserEditComponent implements OnInit {
    public title: string;
    public user: User;
    public identity: User;
    public token: string;
    public status: string;
    public url: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _uploadService: UploadService
    ) {
        this.title = 'Update Information';
        this.identity = this.user = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = environment.url;
    }

    ngOnInit() {
        console.log('[ this.user ] ::: ', this.user);
        console.log('[ use-edit.component is loaded ] ::: ');
    }

    onSubmit(userEditForm: NgForm) {
        console.log('[ this.user ] ::: ', this.user);

        this._userService.updateUser(this.user).subscribe(
            (response) => {
                if (!response.user) {
                    this.status = 'error';
                } else {
                    this.status = 'success';
                    localStorage.setItem(
                        environment.keyIdentity,
                        JSON.stringify(response.user)
                    );
                    this.identity = this.user;

                    // upload image
                    this._uploadService
                        .makeFileRequest(
                            `upload-image-user/${this.user._id}`,
                            [],
                            this.filesToUpload,
                            this.token,
                            'image'
                        )
                        .then((result: any) => {
                            console.log('[ result ] ::: ', result);

                            this.user.image = result.user.image;

                            localStorage.setItem(
                                environment.keyIdentity,
                                JSON.stringify(this.user)
                            );
                        });
                }
            },
            (error) => {
                console.log('[ error ] ::: ', error);

                if (error !== null) this.status = 'error';
            }
        );
    }

    public filesToUpload: Array<File>;
    fileChangeEvent(fileInput: any) {
        this.filesToUpload = <Array<File>>fileInput.target.files;

        console.log(':::', this.filesToUpload);
    }
}
