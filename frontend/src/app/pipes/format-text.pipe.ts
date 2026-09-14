import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'formatText',
  standalone: true,
})
export class FormatTextPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value?: string | null): SafeHtml {
    if (!value) return '';

    const formatted = value
      .replace(
        /(?:\*\*|__)(.+?)(?:\*\*|__)/g,
        '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>',
      )
      .replace(
        /<(?:b|strong)\b[^>]*>(.*?)<\/(?:b|strong)>/gi,
        '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>',
      )
      .replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*/g, '<em class="italic">$1</em>')
      .replace(
        /`([^`]+)`/g,
        '<code class="rounded bg-gray-200/80 dark:bg-gray-800 px-1.5 py-0.5 text-[0.9em] font-mono font-semibold text-indigo-600 dark:text-indigo-400">$1</code>',
      );

    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }
}
