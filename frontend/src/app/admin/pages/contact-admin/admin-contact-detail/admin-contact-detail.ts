import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  NgZone,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, switchMap } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { ContactService } from '../../../../core/services/contact.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { ContactResponse } from '../../../../models/contact.model';
import { TimeAgoPipe } from '../../../../pipes/time-ago.pipe';
import { Error } from '../../../../shared/components/error/error';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-admin-contact-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, TimeAgoPipe, LucideAngularModule, Error],
  templateUrl: './admin-contact-detail.html',
})
export class AdminContactDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);
  private contactService = inject(ContactService);
  private snackBar = inject(SnackBarService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  contact = signal<ContactResponse | null>(null);
  isErrorMsg = signal(false);
  copiedEmail = signal(false);
  copiedMessage = signal(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const id = params.get('id');
          if (!id) return EMPTY;
          this.loaderService.showApi();
          this.contact.set(null);
          return this.contactService.getContactById(id);
        }),
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            this.contact.set(res);
            this.loaderService.hideApi();
            this.cdr.detectChanges();
            if (!res.isRead) this.markAsRead(res._id);
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.isErrorMsg.set(true);
            this.loaderService.hideApi();
            this.snackBar.error(err.error?.message || 'Contact not found');
            this.cdr.detectChanges();
          });
        },
      });
  }

  private markAsRead(id: string): void {
    this.contactService
      .markAsRead(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.contact.update((c) => (c ? { ...c, isRead: true } : c));
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          console.error(err.error?.message || 'Failed to mark as read');
        },
      });
  }

  copyEmail(email: string): void {
    navigator.clipboard.writeText(email);
    this.copiedEmail.set(true);
    this.snackBar.success('Email copied to clipboard');
    setTimeout(() => this.copiedEmail.set(false), 2000);
  }

  copyMessage(text: string): void {
    navigator.clipboard.writeText(text);
    this.copiedMessage.set(true);
    this.snackBar.success('Message copied to clipboard');
    setTimeout(() => this.copiedMessage.set(false), 2000);
  }

  async deleteContact(): Promise<void> {
    const current = this.contact();
    if (!current) return;

    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete inquiry?',
      message: `The message from ${current.firstName} ${current.lastName} will be permanently deleted.`,
    });
    if (!confirmed) return;

    this.loaderService.showApi();
    this.contactService
      .deleteContact(current._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loaderService.hideApi();
          this.snackBar.success('Inquiry deleted successfully');
          this.router.navigate(['/admin/contacts']);
        },
        error: (err) => {
          this.loaderService.hideApi();
          this.snackBar.error(err.error?.message || 'Failed to delete inquiry');
        },
      });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return (parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
  }
}
