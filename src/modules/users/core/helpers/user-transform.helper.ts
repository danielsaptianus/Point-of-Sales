import { User, Employee, Position, PositionPermission, Permission } from '@prisma/client';
import { UserEntity } from '../entities/user.entity';

type UserWithRelations = User & {
  employee?: (Employee & {
    position?: Position & {
      position_permissions?: (PositionPermission & {
        permission: Permission;
      })[];
    };
  }) | null;
};

export class UserTransformHelper {
  static toEntity(user: UserWithRelations): UserEntity {
    const employee = user.employee;
    const position = employee?.position;
    const permissions = position?.position_permissions?.map(
      (pp) => pp.permission.name,
    ) || [];

    return new UserEntity({
      id: user.id,
      email: user.email,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      deleted_at: user.deleted_at,
      first_name: employee?.first_name || '',
      last_name: employee?.last_name || '',
      position_id: employee?.position_id || 0,
      permissions,
      position: position ? {
        id: position.id,
        name: position.name,
        description: position.description,
      } : undefined,
    });
  }

  static toEntities(users: UserWithRelations[]): UserEntity[] {
    return users.map((user) => this.toEntity(user));
  }
}
