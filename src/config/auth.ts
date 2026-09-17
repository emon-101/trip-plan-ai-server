import { MongoClient } from "mongodb";
import sendEmail from "../utils/sendEmail";

const loadBetterAuth = new Function(
  "return import('better-auth')"
) as () => Promise<typeof import("better-auth")>;
const loadMongoAdapter = new Function(
  "return import('@better-auth/mongo-adapter')"
) as () => Promise<typeof import("@better-auth/mongo-adapter")>;
const loadBetterAuthNode = new Function(
  "return import('better-auth/node')"
) as () => Promise<typeof import("better-auth/node")>;

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db(process.env.DB_NAME as string);
const trustedOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean) ?? ["http://localhost:3000", "http://localhost:3001"];

export const authPromise = Promise.all([loadBetterAuth(), loadMongoAdapter()]).then(
  ([{ betterAuth }, { mongodbAdapter }]) =>
    betterAuth({
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:5000/api/auth",
      trustedOrigins,
      advanced: {
        cookiePrefix: "my_app_v2",
        crossSubDomainCookies: {
          enabled: true,
        }
      },
      emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
          const message = `You requested a password reset. Please click this link to set a new password: \n\n ${url}`;
          try {
            await sendEmail({
              to: user.email,
              subject: "Password Reset Request",
              text: message,
            });
            console.log(`Reset email sent successfully to ${user.email}`);
          } catch (error) {
            console.error("Failed to send reset email via BetterAuth:", error);
          }
        },
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      },
      database: mongodbAdapter(db, {
        client,
      }),
      user: {
        additionalFields: {
          role: {
            type: "string",
            defaultValue: "Registered User",
          },
        },
      },
    })
);

export const authRuntimePromise = Promise.all([
  authPromise,
  loadBetterAuthNode(),
]).then(([auth, betterAuthNode]) => ({
  auth,
  ...betterAuthNode,
}));
