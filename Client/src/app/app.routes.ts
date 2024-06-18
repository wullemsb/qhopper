import { Route, Routes } from '@angular/router';
import { DashboardModule } from './dashboard/dashboard.module';
import { connectionGuard } from './dashboard/guards/connection.guard';
import { StartScreenModule } from './start-screen/start-screen.module';

export const dashboardRoute: Route = { path: '', canActivate: [connectionGuard], loadChildren: () => DashboardModule };
export const startScreenRoute: Route = { path: 'login', loadChildren: () => StartScreenModule };

export const routes: Routes = <Route[]>[
    dashboardRoute,
    startScreenRoute
];
