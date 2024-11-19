import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserRole } from 'src/users/user.dto';
import { LogoutReqBody } from 'src/users/users.request';
import { ROLES_KEY } from 'src/utils/decorators/role.decorator';
import { JwtUtilsService } from 'src/utils/jwt/jwtUtils.service';

@Injectable()
export class AccessTokenAuthGuard implements CanActivate {
  constructor(
    private readonly jwtUtilsService: JwtUtilsService,
    private readonly configService: ConfigService,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('User authentication required');
    }
    try {
      const decoded_authorization = this.jwtUtilsService.verifyToken({
        token,
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      });
      (request as Request).decoded_authorization = decoded_authorization;
      return true;
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }
}

@Injectable()
export class RoleAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = (request as Request).decoded_authorization;
    if (!user) {
      throw new UnauthorizedException('User authentication required');
    }
    const isAllowed = requiredRoles.includes(user.role);
    if (!isAllowed) {
      throw new ForbiddenException("You don't have permission to access");
    }
    return isAllowed;
  }
}

@Injectable()
export class EmailVerifyTokenAuthGuard implements CanActivate {
  constructor(
    private readonly jwtUtilsService: JwtUtilsService,
    private readonly configService: ConfigService,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.query.email_verify_token;
    if (!token) {
      throw new UnauthorizedException('User authentication required');
    }
    try {
      const decoded_email_verify = this.jwtUtilsService.verifyToken({
        token,
        secret: this.configService.get<string>('JWT_EMAIL_TOKEN_SECRET'),
      });
      (request as Request).decoded_email_verify = decoded_email_verify;
      return true;
    } catch (e) {
      throw new UnprocessableEntityException(e.message);
    }
  }
}

@Injectable()
export class RefreshTokenAuthGuard implements CanActivate {
  constructor(
    private readonly jwtUtilsService: JwtUtilsService,
    private readonly configService: ConfigService,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = (request.body as LogoutReqBody).refresh_token;
    if (!token) {
      throw new UnauthorizedException('User authentication required');
    }

    try {
      const decoded_refresh_token = this.jwtUtilsService.verifyToken({
        token,
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      const decoded_authorization = (request as Request).decoded_authorization;
      if (decoded_authorization) {
        if (decoded_authorization.user_id !== decoded_refresh_token.user_id) {
          throw new UnauthorizedException('Invalid token');
        }
      }
      (request as Request).decoded_refresh_token = decoded_refresh_token;
      return true;
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }
}
