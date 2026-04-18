import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permisions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) { return true; } // API không đòi quyền -> Cho qua

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.permissions) {
      throw new ForbiddenException('Vui lòng đăng nhập!');
    }

    // Kiểm tra xem User có quyền mà API yêu cầu không
    const hasPermission = requiredPermissions.some((perm) => user.permissions.includes(perm));

    if (!hasPermission) {
      throw new ForbiddenException('Bạn không có quyền thực hiện chức năng này!');
    }

    return true;
  }
}