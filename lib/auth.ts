import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { ObjectId } from 'mongodb';
import { prisma } from './prisma';

function resolveAuthUrl(): string {
  const url = process.env.BETTER_AUTH_URL;
  if (url) return url.replace(/\/+$/, '');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('BETTER_AUTH_URL must be set in production.');
  }
  return 'http://localhost:3000';
}

function resolveAuthSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'BETTER_AUTH_SECRET must be set to a random string of at least 32 characters.'
    );
  }
  return secret;
}

const authUrl = resolveAuthUrl();
const isProduction = process.env.NODE_ENV === 'production';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mongodb',
  }),
  advanced: {
    database: {
      generateId: () => new ObjectId().toHexString(),
    },
  },
  trustedOrigins: [
    ...(isProduction
      ? []
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3100',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
          'http://127.0.0.1:3100',
        ]),
    authUrl,
  ],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: false,
      },
    },
  },
  plugins: [
    admin({
      adminRoles: ['admin'],
      defaultRole: 'user',
    }),
  ],
  baseURL: authUrl,
  secret: resolveAuthSecret(),
});

export type AuthSession = typeof auth.$Infer.Session;
