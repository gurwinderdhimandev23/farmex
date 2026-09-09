import { AuthRepository } from './auth.repository';
import { RegisterInput, LoginInput, ChangePasswordInput } from './auth.schema';
import { hashPassword, verifyPassword, generateRandomToken, hashToken } from '../../shared/utils/crypto.utils';
import { generateAccessToken } from '../../shared/utils/token.utils';
import { ConflictError, AuthenticationError, NotFoundError, UserNotFoundError } from '../../shared/errors/app-error';

export class AuthService {
  private authRepository: AuthRepository;

  constructor(authRepository = new AuthRepository()) {
    this.authRepository = authRepository;
  }

  private sanitizeUser(user: any) {
    const { passwordHash, deletedAt, ...cleanUser } = user;
    return cleanUser;
  }

  private calculateRefreshTokenExpiry(): Date {
    const days = 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }

  async register(input: RegisterInput, userAgent?: string, ipAddress?: string) {
    const existingUser = await this.authRepository.findUserByPhone(input.phone);
    if (existingUser) {
      throw new ConflictError('A user with this phone number already exists');
    }

    const hashedPassword = await hashPassword(input.password);
    const user = await this.authRepository.createUserWithProfile(input, hashedPassword);
    if (!user) {
      throw new Error('Failed to create user account');
    }

    const accessToken = generateAccessToken(user.id, user.role, user.phone);
    const rawRefreshToken = generateRandomToken();
    const tokenHash = hashToken(rawRefreshToken);

    await this.authRepository.createRefreshToken(
      user.id,
      tokenHash,
      this.calculateRefreshTokenExpiry(),
      userAgent,
      ipAddress
    );

    return {
      user: this.sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
      },
    };
  }

  async login(input: LoginInput, userAgent?: string, ipAddress?: string) {
    const user = await this.authRepository.findUserByPhone(input.phone);
    if (!user || user.deletedAt !== null) {
      throw new UserNotFoundError('No account found with this phone number');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account has been deactivated. Please contact support.');
    }

    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid phone number or password');
    }

    const accessToken = generateAccessToken(user.id, user.role, user.phone);
    const rawRefreshToken = generateRandomToken();
    const tokenHash = hashToken(rawRefreshToken);

    await this.authRepository.createRefreshToken(
      user.id,
      tokenHash,
      this.calculateRefreshTokenExpiry(),
      userAgent,
      ipAddress
    );

    return {
      user: this.sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
      },
    };
  }

  async refresh(rawRefreshToken: string, userAgent?: string, ipAddress?: string) {
    const tokenHash = hashToken(rawRefreshToken);
    const tokenRecord = await this.authRepository.findRefreshToken(tokenHash);

    if (!tokenRecord || tokenRecord.isRevoked || new Date() > tokenRecord.expiresAt) {
      throw new AuthenticationError('Refresh token is invalid or has expired');
    }

    if (!tokenRecord.user.isActive || tokenRecord.user.deletedAt !== null) {
      throw new AuthenticationError('User account is inactive');
    }

    // Token Rotation: Invalidate old refresh token
    await this.authRepository.revokeRefreshToken(tokenRecord.id);

    // Issue new pair
    const accessToken = generateAccessToken(tokenRecord.user.id, tokenRecord.user.role, tokenRecord.user.phone);
    const newRawRefreshToken = generateRandomToken();
    const newTokenHash = hashToken(newRawRefreshToken);

    await this.authRepository.createRefreshToken(
      tokenRecord.user.id,
      newTokenHash,
      this.calculateRefreshTokenExpiry(),
      userAgent,
      ipAddress
    );

    return {
      tokens: {
        accessToken,
        refreshToken: newRawRefreshToken,
      },
    };
  }

  async logout(rawRefreshToken?: string, userId?: string) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      const tokenRecord = await this.authRepository.findRefreshToken(tokenHash);
      if (tokenRecord) {
        await this.authRepository.revokeRefreshToken(tokenRecord.id);
      }
    }

    if (userId) {
      await this.authRepository.revokeAllUserTokens(userId);
    }

    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user || user.deletedAt !== null) {
      throw new NotFoundError('User profile not found');
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, input: import('./auth.schema').UpdateProfileInput) {
    const user = await this.authRepository.updateProfile(userId, input);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await verifyPassword(input.oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    const newPasswordHash = await hashPassword(input.newPassword);
    await this.authRepository.updateUserPassword(userId, newPasswordHash);

    // Invalidate existing sessions on password change
    await this.authRepository.revokeAllUserTokens(userId);

    return { message: 'Password changed successfully. Please log in again.' };
  }
}
