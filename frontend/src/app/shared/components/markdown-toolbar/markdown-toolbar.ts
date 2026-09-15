import { Component, input, output } from '@angular/core';

type MarkdownFormat = 'bold' | 'italic' | 'code';

const MARKERS: Record<MarkdownFormat, { marker: string; placeholder: string }> = {
  bold: { marker: '**', placeholder: 'bold text' },
  italic: { marker: '*', placeholder: 'italic text' },
  code: { marker: '`', placeholder: 'code' },
};

@Component({
  selector: 'app-markdown-toolbar',
  standalone: true,
  templateUrl: './markdown-toolbar.html',
})
export class MarkdownToolbar {
  /** id of the <textarea>/<input> this toolbar formats. */
  targetId = input.required<string>();
  value = input('');
  /** Drop the `</>` button where inline code makes no sense. */
  showCode = input(true);

  valueChange = output<string>();

  apply(format: MarkdownFormat): void {
    const el = document.getElementById(this.targetId()) as
      HTMLInputElement | HTMLTextAreaElement | null;
    if (!el) return;

    const { marker, placeholder } = MARKERS[format];
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const current = this.value();
    const selected = current.substring(start, end);
    const inserted = `${marker}${selected || placeholder}${marker}`;

    this.valueChange.emit(current.substring(0, start) + inserted + current.substring(end));

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(
        selected ? start : start + marker.length,
        selected ? start + inserted.length : start + marker.length + placeholder.length,
      );
    }, 10);
  }
}
