import { Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { Error } from '../../../shared/components/error/error';

/** One card: a title, the line under it, and a dated footnote. */
export interface AdminCard {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
}

/**
 * The card grid the profile sub-lists share — header with an add button, loading
 * skeleton, empty state, the cards themselves and the modal shell. The modal body
 * is projected, so each list keeps its own form.
 */
@Component({
  selector: 'app-admin-card-list',
  standalone: true,
  imports: [LucideAngularModule, Error],
  templateUrl: './admin-card-list.html',
})
export class AdminCardList {
  heading = input.required<string>();
  description = input('');
  /** Lucide icon for the cards and the empty state. Must be in the app.config pick list. */
  icon = input.required<string>();
  /** Singular noun for the buttons — "Education", "Experience". */
  noun = input.required<string>();
  emptyTitle = input('');
  emptyText = input('');

  cards = input.required<AdminCard[]>();
  loading = input(false);
  error = input(false);
  formOpen = input(false);

  add = output<void>();
  edit = output<string>();
  remove = output<string>();
  dismiss = output<void>();

  readonly skeletons = [1, 2, 3, 4];
}
