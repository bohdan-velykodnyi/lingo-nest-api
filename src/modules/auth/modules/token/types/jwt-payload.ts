import { type UserRole } from '@/modules/user/enum/user-role.enum';

export type JwtPayload = {
  user_id: string;
  role: UserRole;
};
