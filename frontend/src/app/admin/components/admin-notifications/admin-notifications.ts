import { Component, computed, effect, HostListener, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AdminService } from '../../../core/services/admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NOTIFICATION_TYPES, NotificationResponse } from '../../../models/notification.model';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [LucideAngularModule, TimeAgoPipe],
  templateUrl: './admin-notifications.html',
  styleUrl: './admin-notifications.css',
})
export class AdminNotifications implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);
  store = inject(NotificationService);

  readonly types = NOTIFICATION_TYPES;

  // The store may hold every notification (after the page loaded them); the bell shows 30.
  notifications = computed(() => this.store.notifications().slice(0, 30));
  isOpen = signal(false);
  ringing = signal(false);

  constructor() {
    // Swing the bell briefly for each live arrival.
    effect(() => {
      if (!this.store.latest()) return;

      this.ringing.set(true);
      setTimeout(() => this.ringing.set(false), 1000);
    });
  }

  ngOnInit(): void {
    this.store.load().subscribe({ error: () => {} });

    const token = this.adminService.getToken();
    if (token) this.store.connect(token);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;

    if (this.isOpen() && !target?.closest('app-admin-notifications')) this.close();
  }

  @HostListener('document:keydown.escape')
  close(): void {
    this.isOpen.set(false);
  }

  open(notification: NotificationResponse): void {
    this.close();
    this.store.markRead(notification);
    if (notification.link) this.router.navigateByUrl(notification.link);
  }

  seeAll(): void {
    this.close();
    this.router.navigateByUrl('/admin/notifications');
  }
}
