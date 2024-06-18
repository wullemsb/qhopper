import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { startScreenRoutes } from './start-screen.routes';

@NgModule({
  imports: [RouterModule.forChild(startScreenRoutes)],
  exports: [RouterModule],
})
export class StartScreenRoutingModule { }