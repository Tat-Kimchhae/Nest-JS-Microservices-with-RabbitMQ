import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContext } from './auth.types.js';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest() as any;

    return req.user as UserContext | undefined;
  },
);
