import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ConnectionService } from '../../../shared/services/connection.service';
import { ToastrService } from 'ngx-toastr';
import { ConnectionModel } from '../../../shared/models/connection.model';

@Component({
  selector: 'app-delete-connection',
  templateUrl: './delete-connection.component.html',
  styleUrl: './delete-connection.component.scss'
})

export class DeleteConnectionComponent {
  connection!: ConnectionModel;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private connectionService: ConnectionService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {
    this.connection = data.connection
  }

  deleteConnection() {
    this.connectionService.deleteConnection(this.connection)
    this.toastr.success('Removed connection.')
    this.dialog.closeAll();
  }
}
