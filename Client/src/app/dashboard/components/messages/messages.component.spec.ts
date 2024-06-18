import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MessagesComponent, MessageModel } from './messages.component';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatTableModule } from '@angular/material/table'; 
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'; 
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({selector: 'app-refresh', template: ''})
class RefreshComponent {}

describe('MessagesComponent', () => {
  let component: MessagesComponent;
  let fixture: ComponentFixture<MessagesComponent>;
  let selection: SelectionModel<MessageModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatCheckboxModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatToolbarModule
      ],
      declarations: [MessagesComponent, RefreshComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesComponent);
    component = fixture.componentInstance;
    selection = new SelectionModel<MessageModel>(true, []);
    component.messages = [
      { message_count: 1, properties: { cluster_id: 'cluster1', correlation_id: 'correlation1' }, payload: 'payload1' },
      { message_count: 2, properties: { cluster_id: 'cluster2', correlation_id: 'correlation2' }, payload: 'payload2' }
    ];
    component.selection = selection;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have all rows deselected when isAllSelected returns false', () => {
    component.toggleAllRows();
    component.toggleAllRows();
    expect(component.isAllSelected()).toBeFalse();
  });

  it('should select all rows', () => {
    component.toggleAllRows();
    expect(selection.selected.length).toEqual(component.messages.length);
  });

  it('should have all rows selected when isAllSelected returns true', () => {
    component.toggleAllRows();
    expect(component.isAllSelected()).toBeTrue();
  });

  it('should deselect all rows', () => {
    component.toggleAllRows();
    component.toggleAllRows();
    expect(selection.selected.length).toEqual(0);
  });

  it('should select a row when drag starts', () => {
    const messageToDrag = component.messages[0];
    component.onDragStart(new DragEvent('dragstart'), messageToDrag);
    expect(selection.isSelected(messageToDrag)).toBeTrue();
  });
});