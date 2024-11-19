// Declare the type of the user object
declare module 'express' {
  interface Request {
    decoded_authorization?: JwtPayload;
    decoded_refresh_token?: JwtPayload;
    decoded_email_verify?: JwtPayload;
    decoded_forgot_password?: JwtPayload;
  }
}
