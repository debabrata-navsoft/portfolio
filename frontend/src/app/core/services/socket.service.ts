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

  on<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      if (!this.isBrowser) return;

      const socket = this.connect();
      const handler = (payload: T) => subscriber.next(payload);

      socket.on(event, handler);

      return () => socket.off(event, handler);
    });
  }

  private connect(): Socket {
    this.socket ??= io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    return this.socket;
  }
}
