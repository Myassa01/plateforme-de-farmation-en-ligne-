export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  full_name: string
  password: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
}
