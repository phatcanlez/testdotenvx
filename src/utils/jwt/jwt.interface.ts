import { UserRole } from 'src/users/user.dto';

export interface JwtPayload {
  user_id: string;
  role: UserRole;
}
