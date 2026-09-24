import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { FaqService } from '../../../../core/services/faq.service';
import { FAQResponse } from '../../../../models/faq.model';
import { LoaderService } from '../../../../core/services/loader.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { Error } from '../../../../shared/components/error/error';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import {
  activeStatusColumn,
  activeStatusFilter,
  deleteAction,
  editAction,
  TableAction,
  TableActionEvent,
  TableColumn,
  TableFilter,
} from '../../../../shared/components/data-table/data-table.model';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-admin-faq-list',
  standalone: true,
  imports: [Error, DataTable],
  templateUrl: './admin-faq-list.html',
  host: { class: 'flex min-h-0 min-w-0 flex-1 flex-col h-full' },
})
export class AdminFaqList implements OnInit {
  private router = inject(Router);
  private confirmDialog = inject(ConfirmDialogService);
  private faqService = inject(FaqService);
  private loaderService = inject(LoaderService);
  private snackBarService = inject(SnackBarService);
  private destroyRef = inject(DestroyRef);

  faqs = signal<FAQResponse[]>([]);
  isErrorMsg = signal(false);

  readonly columns: TableColumn<FAQResponse>[] = [
    { key: 'id', header: 'ID', type: 'index', align: 'center' },
    { key: 'question', header: 'QUESTION', cellClass: 'tbl-col-title tbl-col-question' },
    { key: 'answer', header: 'ANSWER', cellClass: 'tbl-col-answer' },
    activeStatusColumn(),
  ];

  readonly filters: TableFilter<FAQResponse>[] = [activeStatusFilter()];

  readonly actions: TableAction<FAQResponse>[] = [editAction('FAQ'), deleteAction('FAQ')];

  ngOnInit(): void {
    this.loaderService.showApi();

    const faqSub = this.faqService.getFAQs(true).subscribe({
      next: (res) => {
        this.faqs.set([...res].sort((a, b) => (b.order ?? 0) - (a.order ?? 0)));

        this.loaderService.hideApi();
      },
      error: (err) => {
        this.isErrorMsg.set(true);
        this.loaderService.hideApi();
        console.log(err.message);
      },
    });

    this.destroyRef.onDestroy(() => {
      faqSub.unsubscribe();
    });
  }

  onAction(event: TableActionEvent<FAQResponse>) {
    switch (event.id) {
      case 'edit':
        this.editFAQ(event.row._id);
        break;
      case 'delete':
        this.deleteFAQ(event.row._id);
        break;
    }
  }

  addFAQ() {
    this.router.navigate(['/admin/faqs/add']);
  }

  editFAQ(id: string) {
    this.router.navigate(['/admin/faqs/edit', id]);
  }

  async deleteFAQ(id: string) {
    if (
      !(await this.confirmDialog.confirm({
        title: 'Delete FAQ?',
        message: 'This question and answer will be permanently deleted.',
      }))
    )
      return;

    const sub = this.faqService.deleteFAQ(id).subscribe({
      next: (res) => {
        this.faqs.update((items) => items.filter((faq) => faq._id !== id));

        this.snackBarService.success(res.message);
      },
      error: (err) => {
        this.snackBarService.error(err.error?.message || 'Failed to delete FAQ');
      },
    });

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
    });
  }
}
