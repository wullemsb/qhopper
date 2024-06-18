import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { RefreshRateOptionModel } from '../../models/refresh-rate-option.model';
import { RefreshRate } from '../../models/refresh-rate.enum';
import { RefreshService } from '../../services/refresh.service';

@Component({
  selector: 'app-refresh',
  templateUrl: './refresh.component.html',
  styleUrl: './refresh.component.scss'
})
export class RefreshComponent {
  public selectedRefreshRateOption: RefreshRate = this.refreshService.getRefreshRateInMilliseconds();
  public isOnCooldown: boolean = false;

  constructor(private refreshService: RefreshService, private toastr: ToastrService) { }

  refreshButtonClicked() {

    try {
      if (this.isOnCooldown) {
        return;
      }

      this.isOnCooldown = true;

      this.refreshService.refreshNow();

      setTimeout(() => {
        this.isOnCooldown = false;
        this.toastr.success('Succesfully refreshed sidebar.');
      }, 1000);

    } catch (error) {
      console.log(error);
    }
  }

  public getRefreshRateOptions(): RefreshRateOptionModel[] {
    return this.refreshService.refreshRateOptions;
  }

  public setRefreshRate() {
    this.refreshService.setRefreshRateInMilliseconds(this.selectedRefreshRateOption);
  }
}
