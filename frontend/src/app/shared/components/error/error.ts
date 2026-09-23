import { Component, inject, input, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './error.html',
  styleUrl: './error.css',
})
export class Error {
  private platformId = inject(PLATFORM_ID);

  title = input('Something went wrong');
  message = input('We could not load this content. Please check your connection and try again.');
  showRetry = input(true);
  /** Public pages only — admin screens have no reason to send the user to the site home. */
  showHome = input(false);

  reload(): void {
    if (isPlatformBrowser(this.platformId)) window.location.reload();
  }
}
