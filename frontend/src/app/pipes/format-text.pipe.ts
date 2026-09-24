import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { highlightCode } from './code-highlight';

const FENCE = /```[ \t]*([\w+#.-]*)[ \t]*\r?\n?([\s\S]*?)```/g;
const BLOCK_TOKEN = /[ \t\r\n]*@@CODEBLOCK(\d+)@@[ \t\r\n]*/g;
const INLINE_CODE = /`([^`\n]+)`/g;

const STRONG = '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>';

const INLINE_RULES: readonly (readonly [RegExp, string])[] = [
  [/(?:\*\*|__)(.+?)(?:\*\*|__)/g, STRONG],
  [/<(?:b|strong)\b[^>]*>(.*?)<\/(?:b|strong)>/gi, STRONG],
  [/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*/g, '<em class="italic">$1</em>'],
];

const INLINE_CODE_CLASS =
  'rounded bg-gray-200/80 dark:bg-gray-800 px-1.5 py-0.5 text-[0.9em] font-mono font-semibold text-indigo-600 dark:text-indigo-400';

const COPY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" ' +
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>' +
  '<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const codeBlock = (code: string, lang: string): string =>
  [
    '<div class="code-block">',
    '<div class="code-block-bar">',
    `<span class="code-block-lang">${escapeHtml(lang || 'code')}</span>`,
    '<button type="button" class="code-copy" title="Copy code">',
    COPY_ICON,
    '<span class="code-copy-label">Copy</span>',
    '</button>',
    '</div>',
    `<pre><code class="hljs">${highlightCode(code, lang)}</code></pre>`,
    '</div>',
  ].join('');

@Pipe({
  name: 'formatText',
  standalone: true,
})
export class FormatTextPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value?: string | null): SafeHtml {
    if (!value) return '';

    const blocks: string[] = [];

    let html = value.replace(FENCE, (_match, lang: string, code: string) => {
      const token = `@@CODEBLOCK${blocks.length}@@`;
      blocks.push(codeBlock(code.replace(/\r?\n$/, ''), lang));
      return token;
    });

    for (const [pattern, replacement] of INLINE_RULES) {
      html = html.replace(pattern, replacement);
    }

    html = html
      .replace(
        INLINE_CODE,
        (_match, code: string) => `<code class="${INLINE_CODE_CLASS}">${escapeHtml(code)}</code>`,
      )
      .replace(BLOCK_TOKEN, (_match, index: string) => blocks[+index] ?? '');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
