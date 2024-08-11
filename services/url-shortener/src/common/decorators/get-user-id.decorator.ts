import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const GetUserId = createParamDecorator(
  (
    _data: { allowUndefined?: boolean } = {},
    ctx: ExecutionContext,
  ): number | undefined => {
    const { allowUndefined } = _data;
    const request = ctx.switchToHttp().getRequest();
    const token = extractTokenFromHeader(request.headers['authorization']);

    if (!token) {
      if (allowUndefined) {
        return undefined;
      } else {
        throw new UnauthorizedException('Token not provided');
      }
    }

    const userId = extractUserIdFromToken(token);

    return userId;
  },
);

function extractTokenFromHeader(
  authorizationHeader?: string,
): string | undefined {
  if (!authorizationHeader) {
    return undefined;
  }

  const [bearer, token] = authorizationHeader.split(' ');

  return bearer === 'Bearer' && token ? token : undefined;
}

function extractUserIdFromToken(token: string): number | undefined {
  const jwtService = new JwtService();

  const decodedToken = jwtService.decode(token) as { sub: string } | null;

  if (!decodedToken || !decodedToken.sub) {
    throw new UnauthorizedException('Invalid token');
  }

  const userId = Number(decodedToken.sub);

  return isNaN(userId) ? undefined : userId;
}
