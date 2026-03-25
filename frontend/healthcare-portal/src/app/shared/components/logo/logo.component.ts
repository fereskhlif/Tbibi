import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  template: `
    <div *ngIf="variant === 'compact'" class="flex items-center justify-center" [class]="className">
      <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
        <lucide-icon name="activity" class="w-6 h-6"></lucide-icon>
      </div>
    </div>
    <div *ngIf="variant !== 'compact'" class="flex items-center gap-3" [class]="className">
      <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
         <lucide-icon name="activity" class="w-6 h-6"></lucide-icon>
      </div>
      <div>
        <div class="text-xl font-bold text-gray-900 leading-none">Tbibi</div>
      </div>
    </div>
  `
})
export class LogoComponent {
  @Input() variant: 'full' | 'compact' = 'full';
  @Input() className: string = '';
}
