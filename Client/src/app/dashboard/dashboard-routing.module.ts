import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { FlexLayoutModule } from '@ngbracket/ngx-layout'; 

export const mainRoute: Route = { path: '', component: MainComponent };

const routes: Routes = [mainRoute];

@NgModule({
  imports: [RouterModule.forChild(routes), FlexLayoutModule],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
