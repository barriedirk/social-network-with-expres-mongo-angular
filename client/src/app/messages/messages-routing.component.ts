import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from './component/main/main.component';
import { AddComponent } from './component/add/add.component';
import { ReceivedComponent } from './component/received/received.component';
import { SendedComponent } from './component/sended/sended.component';

import { UserGuard } from '../guards/user.guard';

const messagesRoutes: Routes = [
    {
        path: 'messages',
        component: MainComponent,
        canActivate: [UserGuard],
        children: [
            {
                path: '',
                redirectTo: 'received',
                pathMatch: 'full',
            },
            {
                path: 'send',
                component: AddComponent,
            },
            {
                path: 'received',
                component: ReceivedComponent,
            },
            {
                path: 'received/:page',
                component: ReceivedComponent,
            },
            {
                path: 'sended',
                component: SendedComponent,
            },
            {
                path: 'sended/:page',
                component: SendedComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(messagesRoutes)],
    exports: [RouterModule],
})
export class MessagesRoutingModule {}
