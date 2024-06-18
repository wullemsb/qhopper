import { Route, Routes } from '@angular/router';
import { StartScreenComponent } from './components/start-screen/start-screen.component';

export const defaultRoute: Route = { title: 'QHopper', path: '', component: StartScreenComponent, pathMatch: 'full' };

export const startScreenRoutes: Routes = <Route[]>[
    defaultRoute
];