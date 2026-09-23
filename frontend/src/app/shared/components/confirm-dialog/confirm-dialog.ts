import { Component, effect, ElementRef, HostListener, inject, viewChild } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

/** Rendered once in `app.html`; opened through `ConfirmDialogService.confirm()`. */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  service = inject(ConfirmDialogService);

  private confirmButton = viewChild<ElementRef<HTMLButtonElement>>('confirmButton');

  constructor() {
    // `autofocus` only fires on page load, not for an element @if adds later — focus it here so
    // Enter confirms (as the browser confirm() did) and keyboard users land inside the dialog.
    effect(() => this.confirmButton()?.nativeElement.focus());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.service.dialog()) this.service.close(false);
  }
}
