import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
}

type OpenDialog = Required<ConfirmOptions> & { resolve: (confirmed: boolean) => void };

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  readonly dialog = signal<OpenDialog | null>(null);

  confirm(options: ConfirmOptions): Promise<boolean> {
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
