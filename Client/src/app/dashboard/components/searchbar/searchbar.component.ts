import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})
export class SearchBarComponent {
  searchControl = new FormControl('');
  @Output() searchChange: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
    this.searchControl.valueChanges.subscribe(() => {
      this.onSearchChange();
    });
  }

  onSearchChange(): void {
    this.searchChange.emit(this.searchControl.value ?? "");
  }

  clearSearch(): void {
    this.searchControl.reset();
    this.onSearchChange();
  }
}
