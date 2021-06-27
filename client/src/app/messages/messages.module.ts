// modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';

// routes
import { MessagesRoutingModule } from './messages-routing.component';

// components
import { MainComponent } from './component/main/main.component';
import { AddComponent } from './component/add/add.component';
import { ReceivedComponent } from './component/received/received.component';
import { SendedComponent } from './component/sended/sended.component';

@NgModule({
    declarations: [
        MainComponent,
        AddComponent,
        ReceivedComponent,
        SendedComponent,
    ],
    imports: [CommonModule, FormsModule, MessagesRoutingModule, MomentModule],
    exports: [MainComponent, AddComponent, ReceivedComponent, SendedComponent],
    providers: [],
})
export class MessagesModule {}
