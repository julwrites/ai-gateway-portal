const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      if (typeof window === 'undefined') {
        // Server-side logging
        console.log('\x1b[36m%s\x1b[0m', '[Server]', ...args);
      } else {
        // Client-side logging
        console.log('%c[Client]', 'color: blue', ...args);
      }
    }
  },
  error: (...args: any[]) => {
    if (isDevelopment) {
      if (typeof window === 'undefined') {
        // Server-side error logging
        console.error('\x1b[31m%s\x1b[0m', '[Server Error]', ...args);
      } else {
        // Client-side error logging
        console.error('%c[Client Error]', 'color: red', ...args);
      }
    }
  }
};
