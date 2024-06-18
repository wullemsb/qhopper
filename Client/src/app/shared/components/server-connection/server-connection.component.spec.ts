import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ServerConnectionComponent } from './server-connection.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConnectionService } from '../../services/connection.service';

describe('ServerConnectionComponent', () => {
  let component: ServerConnectionComponent;
  let fixture: ComponentFixture<ServerConnectionComponent>;
  let connectionService: jasmine.SpyObj<any>;
  let toastrService: jasmine.SpyObj<any>;
  let router: jasmine.SpyObj<any>;
  let dialog: jasmine.SpyObj<any>;

  beforeEach(async () => {
    const connectionServiceSpy = jasmine.createSpyObj('ConnectionService', ['addConnection', 'getAllConnections', 'getConnection']);
    const toastrServiceSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['closeAll']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        BrowserAnimationsModule,
        MatToolbarModule
      ],
      declarations: [ ServerConnectionComponent ],
      providers: [
        FormBuilder,
        { provide: ConnectionService, useValue: connectionServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
    .compileComponents();

    connectionService = TestBed.inject(ConnectionService) as jasmine.SpyObj<any>;
    toastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<any>;
    router = TestBed.inject(Router) as jasmine.SpyObj<any>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<any>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form correctly', () => {
    expect(component.connectionForm).toBeDefined();
    expect(component.connectionForm.get('host')).toBeDefined();
    expect(component.connectionForm.get('username')).toBeDefined();
    expect(component.connectionForm.get('password')).toBeDefined();
  });

  it('should call toastr success and addConnection when form is valid and connection is not already added', () => {
    const formData = {
      host: 'testHost',
      username: 'testUsername',
      password: 'testPassword'
    };
    connectionService.getConnection.and.returnValue(null);
    connectionService.getAllConnections.and.returnValue([]);
    component.connectionForm.setValue(formData);
    component.onSubmit();
    expect(connectionService.getConnection).toHaveBeenCalledWith('testHosttestUsername');
    expect(connectionService.addConnection).toHaveBeenCalledWith('testHosttestUsername', formData);
    expect(connectionService.getAllConnections).toHaveBeenCalled();
    expect(toastrService.success).toHaveBeenCalledWith('Added connection.');
    expect(dialog.closeAll).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
