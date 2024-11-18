import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/users/user.dto';
import { ROLES_KEY } from 'src/utils/decorators/role.decorator';
import { JwtPayload } from 'src/utils/jwt/jwt.interface';
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
      request['decoded_authorization'] = decoded_authorization;
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
    const user = request['decoded_authorization'] as JwtPayload;
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
