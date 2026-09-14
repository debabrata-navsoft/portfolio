import { Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { Error } from '../../../shared/components/error/error';

export interface AdminCard {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
}

@Component({
  selector: 'app-admin-card-list',
  standalone: true,
  imports: [LucideAngularModule, Error],
  templateUrl: './admin-card-list.html',
})
export class AdminCardList {
  heading = input.required<string>();
  description = input('');
  icon = input.required<string>();
  noun = input.required<string>();
  emptyTitle = input('');
  emptyText = input('');

  cards = input.required<AdminCard[]>();
  error = input(false);
  formOpen = input(false);

  add = output<void>();
  edit = output<string>();
  remove = output<string>();
  dismiss = output<void>();
}
