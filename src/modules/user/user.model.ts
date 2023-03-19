export interface IUser {
  id?: number
  provider: string
  full_name: string
  display_name: string
  email: string
  password: string
  google_id?: string
  facebook_id?: string
  date_verified?: string
  date_crated: string
}
