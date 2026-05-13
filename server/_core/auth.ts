import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

export function registerAuthRoutes(app: Express) {
  // Rota de login simplificada para o usuário
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Login super simples para o administrador baseado no OWNER_OPEN_ID
    // Em um sistema real, você usaria senhas hashadas no banco
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const openId = process.env.OWNER_OPEN_ID || "admin-user";
      
      await db.upsertUser({
        openId,
        name: "Administrador",
        email: email,
        role: "admin",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: "Administrador",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      
      res.json({ success: true });
      return;
    }

    res.status(401).json({ error: "Credenciais inválidas" });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME, getSessionCookieOptions(req));
    res.json({ success: true });
  });
}
