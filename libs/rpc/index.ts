import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  INestMicroservice,
  ValidationPipe,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';

export type RpcErrorPayload = {
  code: 'BAD_REQUEST' | 'NOT_FOUND' | 'INTERNAL' | 'UNAUTHORIZED' | 'FORBIDDEN';
  message: string;
  details?: unknown;
};

const isRpcErrorCode = (code: string): code is RpcErrorPayload['code'] =>
  code === 'BAD_REQUEST' ||
  code === 'NOT_FOUND' ||
  code === 'INTERNAL' ||
  code === 'UNAUTHORIZED' ||
  code === 'FORBIDDEN';

const rpcError = (
  code: RpcErrorPayload['code'],
  message: string,
  details?: unknown,
): never => {
  const payload: RpcErrorPayload = { code, message };
  if (details !== undefined) payload.details = details;
  throw new RpcException(payload);
};

export const rpcBadRequest = (message: string, details?: unknown): never =>
  rpcError('BAD_REQUEST', message, details);

export const rpcNotFound = (message: string, details?: unknown): never =>
  rpcError('NOT_FOUND', message, details);

export const rpcInternal = (message: string, details?: unknown): never =>
  rpcError('INTERNAL', message, details);

export const rpcUnauthorized = (message: string, details?: unknown): never =>
  rpcError('UNAUTHORIZED', message, details);

export const rpcForbidden = (message: string, details?: unknown): never =>
  rpcError('FORBIDDEN', message, details);

const toRpcErrorPayload = (exception: unknown): RpcErrorPayload => {
  const candidate =
    exception instanceof RpcException ? exception.getError() : exception;

  if (
    candidate !== null &&
    typeof candidate === 'object' &&
    'code' in candidate &&
    'message' in candidate &&
    typeof candidate.code === 'string' &&
    typeof candidate.message === 'string' &&
    isRpcErrorCode(candidate.code)
  ) {
    return {
      code: candidate.code,
      message: candidate.message,
      ...('details' in candidate ? { details: candidate.details } : {}),
    };
  }

  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const response = exception.getResponse();
    const code: RpcErrorPayload['code'] =
      status === HttpStatus.BAD_REQUEST
        ? 'BAD_REQUEST'
        : status === HttpStatus.NOT_FOUND
          ? 'NOT_FOUND'
          : status === HttpStatus.UNAUTHORIZED
            ? 'UNAUTHORIZED'
            : status === HttpStatus.FORBIDDEN
              ? 'FORBIDDEN'
              : 'INTERNAL';
    const responseMessage =
      typeof response === 'object' && response !== null && 'message' in response
        ? response.message
        : response;
    return {
      code,
      message: Array.isArray(responseMessage)
        ? responseMessage.join(', ')
        : typeof responseMessage === 'string'
          ? responseMessage
          : exception.message,
    };
  }

  return {
    code: 'INTERNAL',
    message:
      exception instanceof Error ? exception.message : 'Internal server error',
  };
};

class RpcAllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, _host: ArgumentsHost) {
    const payload = toRpcErrorPayload(exception);
    return throwError(() => payload);
  }
}
export { RpcAllExceptionFilter };
Catch()(RpcAllExceptionFilter);

export function applyToMicroserviceLayer(app: INestMicroservice): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new RpcAllExceptionFilter());
}

const httpStatusByCode: Record<RpcErrorPayload['code'], number> = {
  BAD_REQUEST: HttpStatus.BAD_REQUEST,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  INTERNAL: HttpStatus.INTERNAL_SERVER_ERROR,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
};

export function mapRpcErrorToHttp(err: unknown): HttpException {
  const payload = toRpcErrorPayload(err);
  return new HttpException(
    {
      code: payload.code,
      message: payload.message,
      ...(payload.details !== undefined ? { details: payload.details } : {}),
    },
    httpStatusByCode[payload.code],
  );
}
