import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class UploadService {
    public url: string;

    constructor() {
        this.url = environment.url;
    }

    makeFileRequest(
        url: string,
        params: Array<string>,
        files: Array<File>,
        token: string,
        name: string
    ) {

        var urlApi = this.url;
        return new Promise(function (resolve, reject) {
            var formData = new FormData();
            var xhr = new XMLHttpRequest();

            for (let i = 0; i < files.length; i++) {
                formData.append(name, files[i], files[i].name);
            }

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200){
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(xhr.response)
                    }
                }
            };

            xhr.open('POST', `${urlApi}${url}`, true);
            xhr.setRequestHeader('Authorization', token);
            xhr.send(formData);
        });
    }
}
