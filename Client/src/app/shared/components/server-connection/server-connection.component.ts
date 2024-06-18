import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConnectionService } from '../../services/connection.service';

@Component({
  selector: 'app-server-connection',
  templateUrl: './server-connection.component.html',
  styleUrl: './server-connection.component.scss'
})
export class ServerConnectionComponent implements OnInit {
  hide: boolean = true;
  connectionForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private connectionService: ConnectionService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private router: Router) { }

  ngOnInit(): void {
    this.connectionForm = this.formBuilder.group({
      host: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.connectionForm.valid) {
      const formData = this.connectionForm.value;
      if (this.connectionService.getConnection(formData.host + formData.username) == null) {
        this.connectionService.addConnection(formData.host + formData.username, formData)
        this.connectionService.connections = this.connectionService.getAllConnections();
        this.toastr.success('Added connection.')
      } else {
        this.toastr.error('This connection already exists!')
      }

      this.dialog.closeAll();
      this.router.navigate(['/']);
    }
  }
}
