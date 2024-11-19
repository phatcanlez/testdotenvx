interface UserType {
  id?: string;
  username?: string;
  name: string;
  email: string;
  password: string;
  created_at?: Date;
  updated_at?: Date;
  email_verify_token?: string;
  forgot_password_token?: string;
  verify_status?: UserVerifyStatus;
  role?: UserRole;
}

export class UserDto {
  id?: string;
  username?: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  email_verify_token: string;
  forgot_password_token: string;
  verify_status: UserVerifyStatus;
  role: UserRole;

  constructor(userData: UserType) {
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.created_at = userData.created_at || new Date();
    this.updated_at = userData.updated_at || new Date();
    this.email_verify_token = userData.email_verify_token || '';
    this.forgot_password_token = userData.forgot_password_token || '';
    this.verify_status = userData.verify_status || UserVerifyStatus.UNVERIFIED;
    this.role = userData.role || UserRole.USER;
  }
}

export enum UserVerifyStatus {
  UNVERIFIED,
  VERIFIED,
  BANNED,
}

export enum UserRole {
  ADMIN,
  STAFF,
  USER,
}
