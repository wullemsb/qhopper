import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConnectionService } from '../../shared/services/connection.service';


export const connectionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const connectionService = inject(ConnectionService);
  const toastr = inject(ToastrService);

  if (connectionService.isConnected()) {
    console.log('Connected!')
    return true;
  } else {
    console.log('No connection found, rerouting to login...')
    toastr.error('Please provide a connection.')
    router.navigate(['/login']);
    return false;
  }
};
