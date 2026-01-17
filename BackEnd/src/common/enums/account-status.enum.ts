export enum AccountStatus {
    PENDING = 'PENDING', // For Lawyers waiting approval
    ACTIVE = 'ACTIVE',   // Clients are active immediately; Lawyers after approval
    BLOCKED = 'BLOCKED',
  }