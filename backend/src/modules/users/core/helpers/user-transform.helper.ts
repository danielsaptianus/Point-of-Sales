import { UserResponseDto } from '@modules/users/core/dto/user-response.dto';
import { User, Employee, Position, PositionPermission, Permission } from '@prisma/client';

type UserWithRelations = User & {
  employee?:
    | (Employee & {
        position?: Position & {
          position_permissions?: (PositionPermission & {
            permission: Permission;
          })[];
        };
      })
    | null;
};

export class UserTransformHelper {
  static toEntity(user: UserWithRelations): UserResponseDto {
    const employee = user.employee;
    const position = employee?.position;
    const permissions = position?.position_permissions?.map((pp) => pp.permission.name) || [];

    return new UserResponseDto({
      id: user.id,
      email: user.email,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      first_name: employee?.first_name || '',
      last_name: employee?.last_name || '',
      position_id: employee?.position_id || 0,
      permissions,
      position: position
        ? {
            id: position.id,
            name: position.name,
            description: position.description,
          }
        : undefined,
    });
  }

  static toEntities(users: UserWithRelations[]): UserResponseDto[] {
    return users.map((user) => this.toEntity(user));
  }
}
