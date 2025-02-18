import type { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}

export const options: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          scope: 'gist user:email'
        }
      },
      httpOptions: {
        timeout: 10000 // Increase timeout to 10 seconds
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    },
    redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true // Enable debug logs
} 