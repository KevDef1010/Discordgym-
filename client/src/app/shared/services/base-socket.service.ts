import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConnectionState } from '../interfaces/socket.interfaces';

/**
 * Base Socket Service
 * Handles core connection management and common functionality
 */
@Injectable({
  providedIn: 'root'
})
export class BaseSocketService {
  protected socket: Socket | null = null;
  protected _connected$ = new BehaviorSubject<boolean>(false);
  protected _connectionState$ = new BehaviorSubject<ConnectionState>({
    connected: false,
    reconnecting: false
  });

  public readonly connected$ = this._connected$.asObservable();
  public readonly connectionState$ = this._connectionState$.asObservable();

  constructor() {}

  protected initialize(namespace: string = '', baseUrl: string = 'http://localhost:3001'): void {
    this.namespace = namespace;
    this.baseUrl = baseUrl;
    this.initializeConnection();
  }

  private namespace: string = '';
  private baseUrl: string = 'http://localhost:3001';

  protected initializeConnection(): void {
    const url = this.namespace ? `${this.baseUrl}${this.namespace}` : this.baseUrl;
    
    this.socket = io(url, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.setupBaseEvents();
  }

  protected setupBaseEvents(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log(`✅ Socket connected to ${this.namespace || 'main'}`);
      this._connected$.next(true);
      this._connectionState$.next({
        connected: true,
        reconnecting: false,
        lastConnected: new Date()
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`❌ Socket disconnected from ${this.namespace || 'main'}:`, reason);
      this._connected$.next(false);
      this._connectionState$.next({
        connected: false,
        reconnecting: reason === 'io server disconnect' ? false : true
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error(`❌ Socket connection error for ${this.namespace || 'main'}:`, error);
      this._connected$.next(false);
      this._connectionState$.next({
        connected: false,
        reconnecting: false,
        error: error.message
      });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected to ${this.namespace || 'main'} after ${attemptNumber} attempts`);
      this._connectionState$.next({
        connected: true,
        reconnecting: false,
        lastConnected: new Date()
      });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Attempting to reconnect to ${this.namespace || 'main'} (attempt ${attemptNumber})`);
      this._connectionState$.next({
        connected: false,
        reconnecting: true
      });
    });
  }

  public connect(): void {
    if (!this.socket) {
      this.initializeConnection();
    } else if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  public disconnect(): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
    this._connected$.next(false);
    this._connectionState$.next({
      connected: false,
      reconnecting: false
    });
  }

  public isConnected(): boolean {
    return this._connected$.value;
  }

  protected emit(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.error(`❌ Cannot emit '${event}' - socket not connected to ${this.namespace || 'main'}`);
      return;
    }
    
    console.log(`📤 Emitting '${event}' to ${this.namespace || 'main'}:`, data);
    this.socket.emit(event, data);
  }

  protected on<T = any>(event: string, callback: (data: T) => void): void {
    if (!this.socket) {
      console.error(`❌ Cannot listen to '${event}' - socket not initialized`);
      return;
    }
    
    this.socket.on(event, callback);
  }

  protected off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
