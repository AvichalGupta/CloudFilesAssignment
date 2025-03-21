import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Roles } from './auth.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request.headers);
    if (!token) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Token Missing',
      });
    }

    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow('JWT_SECRET_KEY'),
      });
      request['user'] = payload as { id: string; type: Roles };
    } catch {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid Token',
      });
    }

    if (!payload.type) {
      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Cannot access resource, Please login first.',
      });
    }

    const pathType = request.path;

    if (pathType.includes('lender')) {
      if (payload.type !== Roles.LENDER) {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message:
            'Cannot access resource, you do not have permission to access this resource.',
        });
      }
    } else if (pathType.includes('org')) {
      if (payload.type !== Roles.ORG) {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message:
            'Cannot access resource, you do not have permission to access this resource.',
        });
      }
    } else if (pathType.includes('rooms') || pathType.includes('bookings')) {
      if (![Roles.LENDER, Roles.ORG, Roles.USER].includes(payload.type)) {
        throw new ForbiddenException({
          statusCode: HttpStatus.FORBIDDEN,
          message:
            'Cannot access resource, you do not have permission to access this resource.',
        });
      } else {
        const userType = payload.type;
        if ([Roles.ORG, Roles.USER].includes(userType)) {
          if (pathType.includes('rooms') && !pathType.includes('get')) {
            throw new ForbiddenException({
              statusCode: HttpStatus.FORBIDDEN,
              message:
                'Cannot access resource, you do not have permission to access this resource.',
            });
          }
        }
      }
    }
    return true;
  }

  private extractTokenFromHeader(headers): string | undefined {
    const token: string | undefined = headers['x-auth-token'] || undefined;
    return token;
  }
}
