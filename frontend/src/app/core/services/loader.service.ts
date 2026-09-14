import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private platformId = inject(PLATFORM_ID);

  startupLoading = signal(false);
  apiLoading = signal(false);

  // Number of page requests still in flight. Components call trackRequest()
  // before subscribing and completeRequest() in both next and error, so the
  // startup loader can stay up until the (slow, cold-starting) API answers.
  private pendingRequests = signal(0);

  contentLoading = computed(() => this.pendingRequests() > 0);

  initStartupLoader() {
    if (!isPlatformBrowser(this.platformId)) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation.type === 'reload' || navigation.type === 'navigate') {
      this.startupLoading.set(true);
    }
  }

  // Manual startup control
  showStartup() {
    this.startupLoading.set(true);
  }

  hideStartup() {
    this.startupLoading.set(false);
  }

  // Content request tracking
  trackRequest() {
    this.pendingRequests.update((count) => count + 1);
  }

  completeRequest() {
    this.pendingRequests.update((count) => (count > 0 ? count - 1 : 0));
  }

  resetRequests() {
    this.pendingRequests.set(0);
  }

  // Page-level failure. The home sections each fetch their own data, so without a
  // shared flag a dead API renders one error card per section.
  contentError = signal(false);

  reportContentError() {
    this.contentError.set(true);
  }

  clearContentError() {
    this.contentError.set(false);
  }

  // API loader control
  showApi() {
    this.apiLoading.set(true);
  }

  hideApi() {
    this.apiLoading.set(false);
  }
}
