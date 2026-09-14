import {
  AfterViewInit,
  Directive,
  ElementRef,
  effect,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  signal,
  output,
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { LoaderService } from '../../core/services/loader.service';

type RevealAnimation = 'up' | 'left' | 'right' | 'scale';

/** Matches the 0.9s transition on `.reveal` in styles.css, plus a frame of slack. */
const TRANSITION_MS = 950;

@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);
  private loaderService = inject(LoaderService);

  private observer?: IntersectionObserver;
  private settleTimer?: ReturnType<typeof setTimeout>;
  private cleanupTimer?: ReturnType<typeof setTimeout>;
  private initialized = signal(false);

  revealAnimation = input<RevealAnimation>('up');
  revealDelay = input(0);
  revealThreshold = input(0.15);
  revealOnce = input(true);

  revealComplete = output<void>();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        const loading = this.loaderService.startupLoading();
        const ready = this.initialized();

        if (!loading && ready) {
          this.observe();
        }
      });
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const host = this.el.nativeElement;

    this.renderer.setStyle(host, 'transition', 'none');
    this.renderer.addClass(host, 'reveal');
    this.renderer.addClass(host, `reveal-${this.revealAnimation()}`);

    void host.offsetHeight;

    requestAnimationFrame(() => {
      this.renderer.removeStyle(host, 'transition');
      this.initialized.set(true);
    });
  }

  private observe() {
    if (this.observer || this.settleTimer) return;

    const host = this.el.nativeElement;

    this.settleTimer = setTimeout(() => {
      this.settleTimer = undefined;

      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              this.renderer.addClass(host, 'reveal-show');
              this.revealComplete.emit();

              if (this.revealOnce()) this.settle(host);
            }, this.revealDelay());

            if (this.revealOnce()) {
              this.observer?.unobserve(host);
            }
          } else if (!this.revealOnce()) {
            this.renderer.removeClass(host, 'reveal-show');
          }
        },
        {
          threshold: this.revealThreshold(),
          rootMargin: '0px 0px -80px 0px',
        },
      );

      this.observer.observe(host);
    }, 150);
  }

  /**
   * Strips the reveal classes once the transition has finished. The element is then
   * plain markup again — no opacity, transform or will-change left on it. WebKit
   * otherwise keeps the host on its own compositing layer and paints nested scroll
   * containers (the article code blocks) blank.
   */
  private settle(host: HTMLElement) {
    this.cleanupTimer = setTimeout(() => {
      this.cleanupTimer = undefined;

      this.renderer.removeClass(host, 'reveal-show');
      this.renderer.removeClass(host, `reveal-${this.revealAnimation()}`);
      this.renderer.removeClass(host, 'reveal');
    }, TRANSITION_MS);
  }

  ngOnDestroy(): void {
    if (this.settleTimer) clearTimeout(this.settleTimer);
    if (this.cleanupTimer) clearTimeout(this.cleanupTimer);
    this.observer?.disconnect();
  }
}
