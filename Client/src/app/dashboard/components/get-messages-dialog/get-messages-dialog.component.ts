import { Component, Input, OnInit } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'get-messages-dialog',
  templateUrl: 'get-messages-dialog.component.html',
  styleUrl: 'get-messages-dialog.component.scss'
})
export class GetMessagesDialog implements OnInit {
  constructor(private spinner: NgxSpinnerService) { }

  ngOnInit() {
    /** spinner starts on init */
    this.spinner.show();
  }
}
