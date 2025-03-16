declare module '@tauri-apps/api/tauri' {
  /**
   * Invoke a Tauri command
   */
  export function invoke<T = any>(command: string, args?: Record<string, any>): Promise<T>;
}

declare module '@tauri-apps/api/event' {
  export interface EventCallback<T> {
    (event: { payload: T }): void;
  }

  /**
   * Listen to an event from the backend
   */
  export function listen<T = any>(event: string, callback: EventCallback<T>): Promise<() => void>;

  /**
   * Emits an event to the backend
   */
  export function emit(event: string, payload?: any): Promise<void>;
}

// Adding global Tauri window types
interface Window {
  __TAURI_IPC__: any;
  __TAURI__: {
    invoke: typeof import('@tauri-apps/api/tauri').invoke;
    listen: typeof import('@tauri-apps/api/event').listen;
  };
}
