import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

import ForgotPasswordEmail from "@/components/emails/reset-password";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { usersTable } from "@/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  basePath: "/api/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users: schema.usersTable,
      sessions: schema.sessionsTable,
      accounts: schema.accountsTable,
      verifications: schema.verificationsTable,
    }
  }),
  plugins: [
    customSession(async ({ user, session }) => {
      const userData = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, user.id),
        with: {
          enterprise: true,
        },
      });

      return {
        user: {
          ...user,
          phone: userData?.phone,
          docNumber: userData?.docNumber,
          avatarImageURL: userData?.avatarImageURL,
          enterprise: userData?.enterprise
            ? {
              id: userData.enterprise.id,
              name: userData.enterprise.name,
              avatarImageURL: userData.enterprise.avatarImageURL,
            }
            : undefined,
        },
        session,
      };
    }),
  ],
  user: {
    modelName: "users",
    additionalFields: {
      phone: {
        type: "string",
        fieldName: "phone",
        required: false,
      },
      docNumber: {
        type: "string",
        fieldName: "docNumber",
        required: false,
      },

    },
  },
  session: {
    modelName: "sessions",
  },
  account: {
    modelName: "accounts",
  },
  verification: {
    modelName: "verifications",
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      resend.emails.send({
        from: `${process.env.NAME_FOR_ACCOUNT_MANAGEMENT_SUBMISSION} <${process.env.EMAIL_FOR_ACCOUNT_MANAGEMENT_SUBMISSION}>`,
        to: user.email,
        subject: "Redefina sua senha - JJ Motobombas App",
        react: ForgotPasswordEmail({
          username: user.name,
          resetUrl: url,
          userEmail: user.email,
        }),
      });
    },
  },
});
