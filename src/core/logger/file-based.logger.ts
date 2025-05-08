import { ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class FileBasedLogger extends ConsoleLogger {
  private readonly logDir = path.join(__dirname, '../../../logs');
  private readonly consoleLogger = new ConsoleLogger();
  private logFile: fs.WriteStream;

  constructor(context?: string) {
    super(context);
    this.ensureLogDirExists();
    this.createLogStream();
  }

  private ensureLogDirExists() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFileName() {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return path.join(this.logDir, `log-${date}.log`);
  }

  private createLogStream() {
    const filePath = this.getLogFileName();
    this.logFile = fs.createWriteStream(filePath, { flags: 'a' });
  }

  private writeToFile(
    level: string,
    message: string,
    context?: string,
    trace?: string,
  ) {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${level.toUpperCase()}] ${context ? `[${context}]` : ''} ${message} ${trace ? `\nTRACE: ${trace}` : ''} \n`;

    const expectedFile = this.getLogFileName();

    if (this.logFile.path !== expectedFile) {
      this.logFile.end();
      this.createLogStream();
    }

    this.logFile.write(formatted);
  }

  log(message: string, context?: string) {
    this.consoleLogger.log(message, context);
    this.writeToFile('log', message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.consoleLogger.error(message, trace, context);
    this.writeToFile('error', message, context, trace);
  }

  warn(message: string, context?: string) {
    this.consoleLogger.warn(message, context);
    this.writeToFile('warn', message, context);
  }

  debug(message: string, context?: string) {
    this.consoleLogger.debug(message, context);
    this.writeToFile('debug', message, context);
  }

  verbose(message: string, context?: string) {
    this.consoleLogger.verbose(message, context);
    this.writeToFile('verbose', message, context);
  }
}
