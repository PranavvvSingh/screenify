import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false, // OAuth only
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (session will be updated if it's older than this)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  hooks: {
    after: [
      {
        matcher: () => true,
        handler: async (ctx) => {
          // When a user signs in via OAuth (not invitation), create a Recruiter record
          if (ctx.path === "/sign-in/social" && ctx.method === "POST" && ctx.user) {
            const userId = ctx.user.id;

            // Check if user already has a recruiter or candidate record
            const existingUser = await prisma.user.findUnique({
              where: { id: userId },
              include: { recruiter: true, candidate: true },
            });

            // Only create recruiter if user has no role yet
            if (existingUser && !existingUser.recruiter && !existingUser.candidate) {
              await prisma.recruiter.create({
                data: {
                  userId: userId,
                },
              });
            }
          }
        },
      },
    ],
  },
});
