import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import * as db from "../db";
import { ENV } from "./env";

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

class SDKServer {
  private getSessionSecret() {
    return new TextEncoder().encode(ENV.cookieSecret);
  }

  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId,
      appId: ENV.appId,
      name: options.name || "",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
    if (!token) return null;
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
      return payload as SessionPayload;
    } catch {
      return null;
    }
  }

  async authenticateRequest(req: Request) {
    const token = req.cookies?.[COOKIE_NAME] || this.parseCookies(req.headers.cookie).get(COOKIE_NAME);
    const session = await this.verifySession(token);
    if (!session) return null;

    const user = await db.getUserByOpenId(session.openId);
    return user || null;
  }

  private parseCookies(cookieHeader: string | undefined) {
    const map = new Map<string, string>();
    if (!cookieHeader) return map;
    cookieHeader.split(";").forEach((cookie) => {
      const [name, ...rest] = cookie.split("=");
      map.set(name.trim(), rest.join("=").trim());
    });
    return map;
  }
}

export const sdk = new SDKServer();
