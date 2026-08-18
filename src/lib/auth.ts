import { betterAuth } from "better-auth";
import { username, twoFactor } from "better-auth/plugins";
import { kyselyAdapter } from "@better-auth/kysely-adapter";
import { getDB } from "../db";

export const auth = betterAuth({
  database: kyselyAdapter({
    db: {
      dialect: "sqlite",
      database: getDB(),
    },
  }),
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 4000}`,
  secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || "change-this-to-a-random-secret-at-least-32-chars",
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        required: false,
        input: false,
      },
    },
  },
  session: {
    modelName: "session",
    expiresIn: 86400, // 24 jam
    updateAge: 3600, // refresh session jika lebih lama dari 1 jam
  },
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    username(),
    twoFactor({
      issuer: "Dashboard Management Affiliate",
      otpOptions: {
        period: 5, // 5 menit
        digits: 6,
        async sendOTP({ user, otp }) {
          const { getUserByEmail: getUserByEmailFromDb } = await import("../lib/db");
          const userData = getUserByEmailFromDb(user.email);
          
          if (!userData?.email) {
            console.error("[2FA] No email for user:", user.email);
            return;
          }
          
          const { sendOTP } = await import("./email");
          await sendOTP(userData.email, otp, userData.username);
        },
      },
    }),
  ],
  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 4000}`,
  ],
});

export type Auth = typeof auth;
