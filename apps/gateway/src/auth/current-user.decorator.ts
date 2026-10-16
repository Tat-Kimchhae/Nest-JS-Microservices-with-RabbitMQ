import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContext } from './auth.types.js';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest() as any;

    return request.user as UserContext | undefined;
  },
);
