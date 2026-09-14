import { DestroyRef, Directive, HostListener, inject } from '@angular/core';

const RESET_DELAY_MS = 1600;
const IDLE_LABEL = 'Copy';
const COPIED_LABEL = 'Copied!';

@Directive({
  selector: '[appCodeCopy]',
  standalone: true,
})
export class CodeCopyDirective {
  private destroyRef = inject(DestroyRef);
  private timer?: ReturnType<typeof setTimeout>;
  private activeLabel?: Element;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  @HostListener('click', ['$event'])
  async onClick(event: Event): Promise<void> {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(
      'button.code-copy',
    );
    const code = button?.closest('.code-block')?.querySelector('code');

    if (!button || !code) return;

    try {
      await navigator.clipboard.writeText(code.textContent ?? '');
    } catch {
      return;
    }

    this.flash(button);
  }

  private flash(button: HTMLButtonElement): void {
    const label = button.querySelector('.code-copy-label');

    if (!label) return;

    this.reset();
    label.textContent = COPIED_LABEL;
    this.activeLabel = label;
    this.timer = setTimeout(() => this.reset(), RESET_DELAY_MS);
  }

  private reset(): void {
    clearTimeout(this.timer);

    if (this.activeLabel) this.activeLabel.textContent = IDLE_LABEL;

    this.activeLabel = undefined;
  }
}
