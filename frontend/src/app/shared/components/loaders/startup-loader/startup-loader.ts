import {
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { GradientText } from '../../gradient-text/gradient-text';
import { LoaderService } from '../../../../core/services/loader.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-startup-loader',
  imports: [GradientText],
  templateUrl: './startup-loader.html',
  styleUrl: './startup-loader.css',
})
export class StartupLoader implements OnInit, OnDestroy {
  private elRef = inject(ElementRef<HTMLElement>);
  private loaderService = inject(LoaderService);
  private platformId = inject(PLATFORM_ID);

  // Keep the intro animation on screen at least this long, but never trap the
  // visitor behind it if the API never answers.
  private readonly MIN_DISPLAY_MS = 2000;
  private readonly SLOW_HINT_MS = 5000;
  private readonly MAX_WAIT_MS = 20000;

  isExiting = signal(false);
  showSlowHint = signal(false);

  private minDisplayDone = signal(false);
  // Plain field, not a signal: read inside the effect below, and tracking it
  // would make the effect re-run on its own write.
  private hasStartedExit = false;

  private exitTimer?: ReturnType<typeof setTimeout>;
  private hintTimer?: ReturnType<typeof setTimeout>;
  private maxWaitTimer?: ReturnType<typeof setTimeout>;
  private exitFallback?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      // Read both signals unconditionally so the effect tracks each of them.
      const minDisplayDone = this.minDisplayDone();
      const contentLoading = this.loaderService.contentLoading();

      if (minDisplayDone && !contentLoading) {
        this.startExit();
      }
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.exitTimer = setTimeout(() => this.minDisplayDone.set(true), this.MIN_DISPLAY_MS);
    this.hintTimer = setTimeout(() => this.showSlowHint.set(true), this.SLOW_HINT_MS);
    this.maxWaitTimer = setTimeout(() => {
      // Give up waiting on the API and show the page with whatever arrived.
      this.loaderService.resetRequests();
      this.startExit();
    }, this.MAX_WAIT_MS);
  }

  // ngOnInit(): void {
  //   setTimeout(() => this.startExit(), 2000);
  // }

  private startExit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.hasStartedExit) return;
    this.hasStartedExit = true;

    this.clearTimers();
    this.isExiting.set(true);

    const content = this.elRef.nativeElement.querySelector('.loader-content');

    const handler = (event: Event) => {
      if (event.target !== content) return;

      content?.removeEventListener('animationend', handler);
      if (this.exitFallback) clearTimeout(this.exitFallback);
      this.loaderService.hideStartup();
    };

    this.exitFallback = setTimeout(() => this.loaderService.hideStartup(), 1000);

    content?.addEventListener('animationend', handler);
  }

  private clearTimers(): void {
    if (this.exitTimer) clearTimeout(this.exitTimer);
    if (this.hintTimer) clearTimeout(this.hintTimer);
    if (this.maxWaitTimer) clearTimeout(this.maxWaitTimer);
  }

  ngOnDestroy() {
    this.clearTimers();
    if (this.exitFallback) clearTimeout(this.exitFallback);
  }
}

// private startExit(): void {
//   this.isExiting.set(true);

//   const content = this.elRef.nativeElement.querySelector('.loader-content');
//   const fallback = setTimeout(() => this.loaderService.hideStartup(), 1000);
//   content?.addEventListener(
//     'animationend',
//     () => {
//       clearTimeout(fallback);
//       this.loaderService.hideStartup();
//     },
//     { once: true },
//   );
// }

//////////////////////////
// private startExit(): void {
//   this.isExiting.set(true);

//   const content = this.elRef.nativeElement.querySelector('.loader-content');
//   content?.addEventListener(
//     'animationend',
//     () => {
//       sessionStorage.setItem('hasVisited', 'true');
//       this.loaderService.hideStartup();
//     },
//     { once: true },
//   );
// }
