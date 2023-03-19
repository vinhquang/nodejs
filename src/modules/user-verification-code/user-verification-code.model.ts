export interface IUserVerificationCode {
  id?: number,
  user_id: number,
  action: string,
  email: string,
  verification_code: string,
  resend_count: number,
  date_expired: string,
  date_verified: string,
  date_updated: string,
  date_crated: string
}
