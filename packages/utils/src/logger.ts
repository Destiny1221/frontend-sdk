import { _support } from './global';
const PREFIX = 'Monitor Logger';

export class Logger {
  private enabled = false;
  private _console: Console = {} as Console;
  constructor() {
    if (globalThis.console) {
      const logType = ['log', 'debug', 'info', 'warn', 'error', 'assert'];
      logType.forEach((level) => {
        if (!(level in globalThis.console)) return;
        // @ts-ignore
        this._console[level] = globalThis.console[level];
      });
    }
  }
  disable(): void {
    this.enabled = false;
  }

  bindOptions(debug: boolean): void {
    this.enabled = debug ? true : false;
  }

  enable(): void {
    this.enabled = true;
  }

  getEnableStatus() {
    return this.enabled;
  }

  log(...args: any[]): void {
    if (!this.enabled) {
      return;
    }
    this._console.log(`${PREFIX}[Log]:`, ...args);
  }
  warn(...args: any[]): void {
    if (!this.enabled) {
      return;
    }
    this._console.warn(`${PREFIX}[Warn]:`, ...args);
  }
  error(...args: any[]): void {
    if (!this.enabled) {
      return;
    }
    this._console.error(`${PREFIX}[Error]:`, ...args);
  }
}
const logger = _support.logger || (_support.logger = new Logger());
export { logger };
