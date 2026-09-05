import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UserRole } from '@prisma/client';

export interface TokenPayload {
  sub: string;       // User ID
  role: UserRole;    // User Role (FARMER, TRANSPORTER, ADMIN)
  phone: string;
  type: 'access' | 'refresh';
}

export const generateAccessToken = (userId: string, role: UserRole, phone: string): string => {
  const payload: TokenPayload = {
    sub: userId,
    role,
    phone,
    type: 'access',
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '24h',
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  if (decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return decoded;
};
