import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { StartScreenComponent } from './components/start-screen/start-screen.component';
import { StartScreenRoutingModule } from './start-screen-routing.module';

@NgModule({
  declarations: [StartScreenComponent],
  imports: [
    CommonModule,
    StartScreenRoutingModule,
    SharedModule,
  ],
})
export class StartScreenModule { }
