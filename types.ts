
export enum UserRole {
  ADMIN = 'ADMIN',
  CLERK = 'CLERK',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  password?: string; // Added for local auth simulation
}

export interface Permit {
  id: string;
  permitNumber: string;
  operatorName: string;
  companyId: string;
  vehicleReg: string;
  route: string;
  issueDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  createdAt: string;
}

export interface Stats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
}
