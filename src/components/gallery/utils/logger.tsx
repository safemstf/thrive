// src/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    // Console logging in development
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? console.error : 
                           level === 'warn' ? console.warn : 
                           console.log;
      
      consoleMethod(`[${level.toUpperCase()}]`, message, data || '');
    }

    // In production, send to logging service
    if (!this.isDevelopment && level === 'error') {
      this.sendToLoggingService(entry);
    }
  }

  private sendToLoggingService(entry: LogEntry): void {
    // Example Sentry implementation:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(entry.error || new Error(entry.message), {
    //     level: entry.level,
    //     extra: entry.data,
    //   });
    // }

    // Example custom logging endpoint:
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry),
    // }).catch(() => {
    //   // Fail silently to avoid infinite error loops
    // });
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | any, data?: any): void {
    const logData = {
      ...data,
      errorMessage: error?.message,
      errorStack: error?.stack,
    };
    
    this.log('error', message, logData);
  }
}

// Export singleton instance
export const logger = new Logger();