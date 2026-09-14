import { Component, inject, input, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './error.html',
})
export class Error {
  private platformId = inject(PLATFORM_ID);

  title = input('Something went wrong');
  message = input('We could not load this content. Please check your connection and try again.');
  showRetry = input(true);

  reload(): void {
    if (isPlatformBrowser(this.platformId)) window.location.reload();
  }
}
