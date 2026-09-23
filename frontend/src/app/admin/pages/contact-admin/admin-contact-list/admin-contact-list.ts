import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ContactService } from '../../../../core/services/contact.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { ContactResponse } from '../../../../models/contact.model';
import { Error } from '../../../../shared/components/error/error';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import {
  deleteAction,
  TableAction,
  TableActionEvent,
  TableColumn,
  TableFilter,
  viewAction,
} from '../../../../shared/components/data-table/data-table.model';

@Component({
  selector: 'app-admin-contact-list',
  standalone: true,
  imports: [Error, DataTable],
  templateUrl: './admin-contact-list.html',
  styleUrl: './admin-contact-list.css',
  host: { class: 'flex min-h-0 min-w-0 flex-1 flex-col h-full' },
})
export class AdminContactList implements OnInit {
  private contactService = inject(ContactService);
  private router = inject(Router);
  private loaderService = inject(LoaderService);
  private snackBarService = inject(SnackBarService);
  private destroyRef = inject(DestroyRef);

  contacts = signal<ContactResponse[]>([]);
  isErrorMsg = signal(false);

  readonly columns: TableColumn<ContactResponse>[] = [
    { key: 'id', header: 'ID', type: 'index', align: 'center' },
    {
      key: 'name',
      header: 'NAME',
      value: (row) => `${row.firstName} ${row.lastName}`,
      cellClass: 'tbl-col-title',
    },
    { key: 'email', header: 'EMAIL ADDRESS' },
    { key: 'createdAt', header: 'DATE', type: 'date' },
    { key: 'subject', header: 'SUBJECT' },
    {
      key: 'isRead',
      header: 'STATUS',
      type: 'badge',
      align: 'center',
      value: (row) => (row.isRead ? 'Read' : 'New Inquiry'),
    },
  ];

  readonly filters: TableFilter<ContactResponse>[] = [
    {
      key: 'isRead',
      label: 'Status',
      single: true,
      value: (row) => (row.isRead ? 'read' : 'new'),
      options: [
        { value: 'new', label: 'New' },
        { value: 'read', label: 'Read' },
      ],
    },
    { key: 'createdAt', label: 'Received Date', type: 'date' },
  ];

  readonly actions: TableAction<ContactResponse>[] = [
    viewAction('message', 'eye'),
    deleteAction('message'),
  ];

  ngOnInit(): void {
    this.loaderService.showApi();
    const contactSub = this.contactService.getContacts().subscribe({
      next: (res) => {
        this.contacts.set(
          res.sort(
            (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
          ),
        );
        this.loaderService.hideApi();
      },
      error: (err) => {
        this.isErrorMsg.set(true);
        this.loaderService.hideApi();
        console.log(err.message);
      },
    });

    this.destroyRef.onDestroy(() => {
      contactSub.unsubscribe();
    });
  }

  onAction(event: TableActionEvent<ContactResponse>) {
    switch (event.id) {
      case 'view':
        this.viewContact(event.row._id);
        break;
      case 'delete':
        this.deleteContact(event.row._id);
        break;
    }
  }

  deleteContact(id: string) {
    const confirmed = confirm('Are you sure you want to delete this contact?');

    if (!confirmed) return;

    const sub = this.contactService.deleteContact(id).subscribe({
      next: (res) => {
        this.contacts.update((items) => items.filter((contact) => contact._id !== id));

        this.snackBarService.success(res.message);
      },
      error: (err) => {
        this.snackBarService.error(err.error?.message || 'Failed to delete contact');
      },
    });

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
    });
  }

  viewContact(id: string) {
    this.router.navigate(['/admin/contacts', id]);
  }
}
