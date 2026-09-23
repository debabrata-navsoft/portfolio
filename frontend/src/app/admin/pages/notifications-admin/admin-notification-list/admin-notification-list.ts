import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { LoaderService } from '../../../../core/services/loader.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { NOTIFICATION_TYPES, NotificationResponse } from '../../../../models/notification.model';
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
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-admin-notification-list',
  standalone: true,
  imports: [Error, DataTable],
  templateUrl: './admin-notification-list.html',
  host: { class: 'flex min-h-0 min-w-0 flex-1 flex-col h-full' },
})
export class AdminNotificationList implements OnInit {
  private router = inject(Router);
  private confirmDialog = inject(ConfirmDialogService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);
  store = inject(NotificationService);

  isErrorMsg = signal(false);

  readonly columns: TableColumn<NotificationResponse>[] = [
    { key: 'id', header: 'ID', type: 'index', align: 'center' },
    {
      key: 'type',
      header: 'TYPE',
      type: 'badge',
      align: 'center',
      value: (row) => NOTIFICATION_TYPES[row.type].label,
      badgeClass: (row) => NOTIFICATION_TYPES[row.type].badgeClass,
    },
    { key: 'title', header: 'NOTIFICATION', cellClass: 'tbl-col-title' },
    { key: 'message', header: 'DETAILS' },
    { key: 'createdAt', header: 'RECEIVED', type: 'timeAgo' },
    {
      key: 'isRead',
      header: 'STATUS',
      type: 'badge',
      align: 'center',
      value: (row) => (row.isRead ? 'Read' : 'Unread'),
      badgeClass: (row) => (row.isRead ? 'tbl-badge-read' : 'tbl-badge-warning'),
    },
  ];

  readonly filters: TableFilter<NotificationResponse>[] = [
    {
      key: 'type',
      label: 'Type',
      options: Object.entries(NOTIFICATION_TYPES).map(([value, { label }]) => ({ value, label })),
    },
    {
      key: 'isRead',
      label: 'Status',
      single: true,
      value: (row) => (row.isRead ? 'read' : 'unread'),
      options: [
        { value: 'unread', label: 'Unread' },
        { value: 'read', label: 'Read' },
      ],
    },
    { key: 'createdAt', label: 'Received', type: 'date' },
  ];

  readonly actions: TableAction<NotificationResponse>[] = [
    viewAction('notification', 'external-link'),
    {
      id: 'read',
      icon: 'check-check',
      label: 'Mark as read',
      class: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      hidden: (row) => row.isRead,
    },
    deleteAction('notification'),
  ];

  // Live arrivals come in through the store, so the table needs no socket of its own.
  ngOnInit(): void {
    this.loaderService.showApi();

    const sub = this.store
      .load(true)
      .pipe(finalize(() => this.loaderService.hideApi()))
      .subscribe({ error: () => this.isErrorMsg.set(true) });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  async onAction({ id, row }: TableActionEvent<NotificationResponse>) {
    switch (id) {
      case 'view':
        this.store.markRead(row);
        if (row.link) this.router.navigateByUrl(row.link);
        break;
      case 'read':
        this.store.markRead(row);
        break;
      case 'delete':
        if (
          await this.confirmDialog.confirm({
            title: 'Delete notification?',
            message: 'This notification will be removed.',
          })
        ) {
          this.store.remove(row);
        }
        break;
    }
  }
}
