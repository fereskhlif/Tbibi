import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-nav-button',
  template: `
    <button
      (click)="onClick.emit()"
      [class]="'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ' + (active ? 'bg-blue-50 text-blue-600 font-medium shadow-sm ring-1 ring-blue-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')"
    >
      <lucide-icon [name]="icon" [class]="'w-5 h-5 flex-shrink-0'"></lucide-icon>
      <span class="text-sm whitespace-nowrap">
        <ng-content></ng-content>
      </span>
    </button>
  `
})
export class NavButtonComponent {
  @Input() active: boolean = false;
  @Input() icon: string = '';
  @Output() onClick = new EventEmitter<void>();
}
