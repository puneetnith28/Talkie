export interface LogMeta {
  requestId?: string;
  workspaceId?: string;
  [key: string]: any;
}

export class Logger {
  private context: string;

  constructor(context: string = 'Talkie') {
    this.context = context;
  }

  private format(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string, meta?: LogMeta) {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      timestamp,
      level,
      context: this.context,
      message,
      ...meta,
    });
  }

  public info(message: string, meta?: LogMeta) {
    console.log(this.format('INFO', message, meta));
  }

  public warn(message: string, meta?: LogMeta) {
    console.warn(this.format('WARN', message, meta));
  }

  public error(message: string, meta?: LogMeta) {
    console.error(this.format('ERROR', message, meta));
  }

  public debug(message: string, meta?: LogMeta) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('DEBUG', message, meta));
    }
  }
}

export const appLogger = new Logger('App');
