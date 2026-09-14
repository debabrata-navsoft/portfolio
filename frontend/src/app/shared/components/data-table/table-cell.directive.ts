import { Directive, inject, input, TemplateRef } from '@angular/core';

import { TableCellContext } from './data-table.model';

/**
 * Marks an `<ng-template>` as the renderer for one `app-data-table` column:
 *
 * ```html
 * <ng-template appTableCell="website" let-row>…</ng-template>
 * ```
 *
 * The attribute value is the column `key`. Columns without a template fall back
 * to the built-in renderer for their `type`.
 */
@Directive({
  selector: 'ng-template[appTableCell]',
  standalone: true,
})
export class TableCell {
  /** Key of the column this template renders. */
  appTableCell = input.required<string>();

  readonly template = inject<TemplateRef<TableCellContext>>(TemplateRef);

  static ngTemplateContextGuard(dir: TableCell, ctx: unknown): ctx is TableCellContext {
    return true;
  }
}
