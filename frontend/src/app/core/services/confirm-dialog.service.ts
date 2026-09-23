import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
}

type OpenDialog = Required<ConfirmOptions> & { resolve: (confirmed: boolean) => void };

/**
 * Replaces the browser `confirm()` with the app's own dialog. One `<app-confirm-dialog />` in
 * `app.html` renders whatever is open here, so any page can just
 * `if (!(await this.confirmDialog.confirm({ message: '…' }))) return;`
 */
@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  readonly dialog = signal<OpenDialog | null>(null);

  confirm(options: ConfirmOptions): Promise<boolean> {
    // A second request while one is open answers the first with "no" rather than losing it.
    this.close(false);

    return new Promise((resolve) =>
      this.dialog.set({ title: 'Are you sure?', confirmText: 'Delete', ...options, resolve }),
    );
  }

  close(confirmed: boolean): void {
    this.dialog()?.resolve(confirmed);
    this.dialog.set(null);
  }
}
