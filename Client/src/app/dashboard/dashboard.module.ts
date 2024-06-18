// Modules
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { OWL_DATE_TIME_FORMATS, OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { OwlMomentDateTimeModule } from '@danielmoncada/angular-datetime-picker-moment-adapter';
import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';
import { NgxSpinnerModule } from "ngx-spinner";
import { SharedModule } from '../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_MOMENT_FORMATS = {
    parseInput: 'DD/MM/YYYY kk:mm:ss',
    fullPickerInput: 'DD/MM/YYYY kk:mm:ss',
    datePickerInput: 'l',
    timePickerInput: 'LT',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
};

// Components
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConnectionsComponent } from './components/connections/connections.component';
import { MainComponent } from './components/main/main.component';
import { MessagesComponent } from './components/messages/messages.component';
import { RefreshComponent } from './components/refresh/refresh.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

// Services
import { Md5 } from 'ts-md5';
import { DeleteConnectionComponent } from './components/delete-connection/delete-connection.component';
import { GetMessagesDialog } from './components/get-messages-dialog/get-messages-dialog.component';
import { MessageDetailsComponent } from './components/message-details/message-details.component';
import { MoveMessagesConfirmationDialog } from './components/move-messages-confirmation-dialog/move-message-confirmation-dialog.component';
import { MoveMessagesProgressDialog } from './components/move-messages-progress-dialog/move-messages-progress-dialog.component';
import { RabbitApiService } from './services/rabbit-api.service';
import { RefreshService } from './services/refresh.service';
import { DeleteMessagesConfirmationDialog } from './components/delete-messages-confirmation-dialog/delete-messages-confirmation-dialog.component';
import { DeleteMessagesProgressDialog } from './components/delete-messages-progress-dialog/delete-messages-progress-dialog.component';

@NgModule({
    declarations: [
        SidebarComponent,
        MainComponent,
        ConnectionsComponent,
        MessagesComponent,
        MessageDetailsComponent,
        RefreshComponent,
        MoveMessagesConfirmationDialog,
        MoveMessagesProgressDialog,
        GetMessagesDialog,
        DeleteConnectionComponent,
        DeleteMessagesConfirmationDialog,
        DeleteMessagesProgressDialog
    ],
    imports: [
        CommonModule,
        DashboardRoutingModule,
        SharedModule,
        HttpClientModule,
        MatDialogModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        ScrollingModule,
        TableVirtualScrollModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        OwlMomentDateTimeModule,
        NgxSpinnerModule,
        MatBadgeModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [{ provide: OWL_DATE_TIME_FORMATS, useValue: MY_MOMENT_FORMATS }, RabbitApiService, RefreshService, Md5, provideNativeDateAdapter()]
})
export class DashboardModule { }
