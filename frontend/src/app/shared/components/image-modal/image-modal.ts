import { Component, HostListener, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './image-modal.html',
  styleUrl: './image-modal.css',
})
export class ImageModal {
  isOpen = model<boolean>(false);
  src = input<string | null | undefined>('');
  alt = input<string>('Fullscreen Image Preview');
  closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }
}
