import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ServerConnectionComponent } from '../../../shared/components/server-connection/server-connection.component';
import { ConnectionModel } from '../../../shared/models/connection.model';
import { ConnectionService } from '../../../shared/services/connection.service';
import { DeleteConnectionComponent } from '../delete-connection/delete-connection.component';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss']
})
export class ConnectionsComponent implements OnInit {
  @Output() selectedConnectionChange = new EventEmitter<ConnectionModel>();
  connections: ConnectionModel[] = [];
  selectedConnection!: ConnectionModel;

  constructor(private _connectionService: ConnectionService, private toastrService: ToastrService, private router: Router, public dialog: MatDialog,) { }

  ngOnInit(): void {
    this.connections = this._connectionService.connections;

    if (this.connections.length <= 0) {
      this.router.navigate(['/login']);
      this.toastrService.error('There was no connection detected, please reconnect.')
    }

    this.selectedConnection = this.connections[0];
    this.onSelectedConnectionChange(this.selectedConnection);
  }

  openConnectionDialog() {
    const dialogRef = this.dialog.open(ServerConnectionComponent);

    dialogRef.afterClosed().subscribe(() => {
      const currentConnectionsLength = this.connections.length;

      // Update the connections array
      this.connections = this._connectionService.connections;

      // Check if a new connection has been added
      if (this.connections.length > currentConnectionsLength) {
        const newlyAddedConnection = this.connections[this.connections.length - 1]; // Assuming the newly added connection is added at the end of the connections array
        this.selectedConnection = newlyAddedConnection;
        this.onSelectedConnectionChange(this.selectedConnection);
      }
    });
  }

  onSelectedConnectionChange(value: ConnectionModel): void {
    this.selectedConnectionChange.emit(value);
  }

  openDialogDelete() {
    const dialogRef = this.dialog.open(DeleteConnectionComponent, {
      data: {
        connection: this.selectedConnection,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      // Save the index of the currently selected connection
      const selectedIndex = this.connections.findIndex(connection => connection === this.selectedConnection);

      this.connections = this._connectionService.connections;

      // Check if the selected connection is deleted
      if (this.connections.findIndex(connection => connection === this.selectedConnection) === -1) {

        // If the selected connection is deleted, select the previous connection
        if (selectedIndex > 0) {
          this.selectedConnection = this.connections[selectedIndex - 1];
        } else if (selectedIndex === 0 && this.connections.length > 0) {

          // If the first connection is deleted but there are other connections available, select the first connection
          this.selectedConnection = this.connections[0];
        } else {

          // If all connections are deleted
          this.router.navigate(['/login']);
        }
        
        this.onSelectedConnectionChange(this.selectedConnection);
      }
    });
  }
}

export interface DialogData {
  connection: ConnectionModel;
}
