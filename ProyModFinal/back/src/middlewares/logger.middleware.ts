import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(
      `[LOGGER] ${new Date().toLocaleString()} | Method: ${req.method} | URL: ${req.originalUrl}`,
    );
    next();
  }
}

export function loggerGlobal(req: Request, res: Response, next: NextFunction) {
  console.log(
    `[LOGGER] ${new Date().toLocaleString()} | Method: ${req.method} | URL: ${req.originalUrl}`,
  );
  next();
}
