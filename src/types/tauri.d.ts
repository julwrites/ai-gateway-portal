// Type declarations for Tauri
declare module '@tauri-apps/api/tauri' {
  export function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T>;
}

// Add Tauri window object
interface Window {
  __TAURI__?: {
    invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
    [key: string]: any;
  }
}
