import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class SnackBarService {
  private snackBar = inject(MatSnackBar);

  success(message: string) {
    this.snackBar.open(message, 'close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
    });
  }

  /**
   * Readable message for a failed request. Never shows Angular's raw
   * "Http failure response for … 0 Unknown Error" text: status 0 means the API was unreachable.
   */
  httpError(err: HttpErrorResponse, fallback = 'Something went wrong. Please try again.') {
    const message =
      err.status === 0
        ? "Can't reach the server right now. Please check your connection and try again."
        : err.error?.message || fallback;

    this.error(message);
  }

  error(message: string) {
    this.snackBar.open(message, 'close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
    });
  }
}
