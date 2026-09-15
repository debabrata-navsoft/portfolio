import { Component, input } from '@angular/core';

import { CodeCopyDirective } from '../../directives/code-copy.directive';
import { FormatTextPipe } from '../../../pipes/format-text.pipe';

@Component({
  selector: 'app-markdown-preview',
  standalone: true,
  imports: [CodeCopyDirective, FormatTextPipe],
  templateUrl: './markdown-preview.html',
})
export class MarkdownPreview {
  value = input('');
  /** Heading above the rendered text, e.g. "Overview Preview". */
  label = input('Preview');
}
