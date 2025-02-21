export type AuthMode = 'create' | 'login' | 'google' | 'profile'
export type ModelEndpoint = 'user' | 'account' | 'profile'
export type MongoModel = MyaUser | MyaAccount | MyaProfile
export type UserRole = 'admin' | 'employee' | 'external' | ''
export type AccountClient = 'google' | 'mya'

// Base
interface BaseEntity {
  _id: string
}

// User
export interface BaseUser {
  firstName: string
  lastName: string
  email: string
  image: string
}

export interface MyaUser extends BaseEntity, BaseUser { }
export interface NewUser extends BaseUser { }

// Account
export interface BaseAccount {
  user: string
  client: AccountClient
  email: string
  password: string
  isMerged: boolean
}

export interface MyaAccount extends BaseEntity, BaseAccount { }
export interface NewAccount extends BaseAccount { }

// Profile
export interface BaseProfile {
  user: string
  role: UserRole
  supervisor: string
  employees: string[]
  completed: boolean
}

export interface MyaProfile extends BaseEntity, BaseProfile { }
export interface NewProfile extends BaseProfile { }

// Login Form
export interface LoginForm extends BaseUser {
  client: AccountClient
  password: string
  confirmPassword: string
}

export interface GoogleJWT {
  sub: string
  name: string
  given_name: string
  family_name: string
  picture: string
  email: string
  email_verified: boolean
  locale: string
}

export interface GoogleAccount {
  email: string
  email_verified: boolean
  given_name: string
  family_name: string
  name: string
  picture: string
  sub: string
}
