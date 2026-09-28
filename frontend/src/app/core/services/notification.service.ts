import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { NotificationListResponse, NotificationResponse } from '../../models/notification.model';
import { SnackBarService } from './snack-bar.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private socketService = inject(SocketService);
  private snackBarService = inject(SnackBarService);
  private apiUrl = `${environment.apiUrl}/notifications`;

  notifications = signal<NotificationResponse[]>([]);
  unreadCount = signal(0);
  latest = signal<NotificationResponse | null>(null);

  private hasAll = false;
  private listening = false;

  connect(token: string): void {
    this.socketService.joinAdmin(token);

    if (this.listening) return;
    this.listening = true;

    this.socketService.on<NotificationResponse>('notification:new').subscribe((notification) => {
      this.notifications.update((list) => [notification, ...list]);
      this.unreadCount.update((count) => count + 1);
      this.latest.set(notification);
    });

    this.socketService
      .on<NotificationResponse>('notification:removed')
      .subscribe((notification) => this.drop(notification));
  }

  load(all = false): Observable<NotificationListResponse> {
    return this.http
      .get<NotificationListResponse>(this.apiUrl, { params: all ? { all: 'true' } : undefined })
      .pipe(
        tap((res) => {
          if (!all && this.hasAll) return;

          this.hasAll ||= all;
          this.notifications.set(res.items || []);
          this.unreadCount.set(res.unreadCount || 0);
        }),
      );
  }

  markRead(notification: NotificationResponse): void {
    if (notification.isRead) return;

    this.notifications.update((list) =>
      list.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n)),
    );
    this.unreadCount.update((count) => Math.max(0, count - 1));
    this.persist(this.http.patch(`${this.apiUrl}/${notification._id}/read`, {}));
  }

  markAllRead(): void {
    this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
    this.unreadCount.set(0);
    this.persist(this.http.patch(`${this.apiUrl}/read-all`, {}));
  }

  remove(notification: NotificationResponse): void {
    this.drop(notification);
    this.persist(this.http.delete(`${this.apiUrl}/${notification._id}`));
  }

  private drop(notification: NotificationResponse): void {
    this.notifications.update((list) => list.filter((n) => n._id !== notification._id));
    if (!notification.isRead) this.unreadCount.update((count) => Math.max(0, count - 1));
  }

  clearAll(): void {
    this.notifications.set([]);
    this.unreadCount.set(0);
    this.persist(this.http.delete(this.apiUrl));
  }

  private persist(request: Observable<unknown>): void {
    request.subscribe({
      error: (err) =>
        this.snackBarService.error(err.error?.message || "Couldn't update notifications"),
    });
  }
}
