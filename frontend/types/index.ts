export enum UserRole {
    ADMIN = 'ADMIN',
    LAWYER = 'LAWYER',
    CLIENT = 'CLIENT',
  }
  
  export enum AccountStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    BLOCKED = 'BLOCKED',
  }
  
  export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: AccountStatus;
  }
  
  export interface AuthResponse {
    access_token: string;
    user: User;
  }