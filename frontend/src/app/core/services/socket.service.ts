import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { environment } from '../../../environments/environment';

const SOCKET_URL = environment.apiUrl.replace(/\/api\/?$/, '');

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private socket?: Socket;
  private adminToken: string | null = null;

  on<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      if (!this.isBrowser) return;

      const socket = this.connect();
      const handler = (payload: T) => subscriber.next(payload);

      socket.on(event, handler);

      return () => socket.off(event, handler);
    });
  }

  /**
   * Proves the admin token so this connection joins the server's admin room (notifications).
   * Re-sent on every reconnect, since a new connection starts outside the room.
   */
  joinAdmin(token: string): void {
    if (!this.isBrowser) return;

    this.adminToken = token;

    const socket = this.connect();
    if (socket.connected) socket.emit('admin:join', token);
  }

  leaveAdmin(): void {
    this.adminToken = null;
    this.socket?.emit('admin:leave');
  }

  private connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
      this.socket.on('connect', () => {
        if (this.adminToken) this.socket!.emit('admin:join', this.adminToken);
      });
    }

    return this.socket;
  }
}
