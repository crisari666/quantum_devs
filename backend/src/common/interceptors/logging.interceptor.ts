import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const started = Date.now();
    const { method, originalUrl, ip } = req;
    const queryKeys =
      req.query && typeof req.query === 'object'
        ? Object.keys(req.query as Record<string, unknown>)
        : [];
    const queryPart =
      queryKeys.length > 0 ? ` query=${JSON.stringify(req.query)}` : '';

    this.logger.log(`→ ${method} ${originalUrl}${queryPart} ip=${ip ?? '?'}`);

    return next.handle().pipe(
      tap({
        finalize: () => {
          const res = http.getResponse<Response>();
          const ms = Date.now() - started;
          this.logger.log(
            `← ${method} ${originalUrl} ${res.statusCode} ${ms}ms`,
          );
        },
      }),
    );
  }
}
