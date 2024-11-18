interface TokenDataType {
  id?: string;
  user_id: string;
  token: string;
  token_type: TokenType;
  created_at?: Date;
  updated_at?: Date;
}

export class TokenDto {
  id?: string;
  user_id: string;
  token: string;
  token_type: TokenType;
  created_at: Date;
  updated_at: Date;

  constructor(tokenData: TokenDataType) {
    this.user_id = tokenData.user_id;
    this.token = tokenData.token;
    this.token_type = tokenData.token_type;
    this.created_at = tokenData.created_at || new Date();
    this.updated_at = tokenData.updated_at || new Date();
  }
}

export enum TokenType {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  EMAIL_VERIFY_TOKEN,
  FORGOT_PASSWORD_TOKEN,
}
