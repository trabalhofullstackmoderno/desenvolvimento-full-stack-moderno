import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { OAuth2Token } from "@fastify/oauth2";
import { PrismaClient } from "@prisma/client";
import { InvalidCredentialsError } from "@/services/errors/invalid-credentials-error";
import { EmailValidationService } from "@/services/email-validation-service";
import crypto from "crypto";

const prisma = new PrismaClient();

interface GoogleToken extends OAuth2Token {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export async function authenticate(
  app: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { token } =
      (await app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
        request,
      )) as GoogleToken;

    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${token.access_token}` },
      },
    );

    const userInfo = (await userInfoRes.json()) as GoogleUserInfo;

    // Validar se o email possui domínio permitido usando o serviço de validação
    const validatedEmail = EmailValidationService.validateAndNormalize(userInfo.email);
    if (!validatedEmail) {
      const frontendUrl = process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL || "http://localhost:3000"
        : "http://localhost:3000";

      const errorMessage = `Acesso restrito a emails ${EmailValidationService.getAllowedDomain()}`;
      return reply.redirect(`${frontendUrl}/login?error=domain_not_allowed&message=${encodeURIComponent(errorMessage)}`);
    }

    // Encrypt tokens before storing
    const encryptedAccessToken = encryptToken(token.access_token);
    const encryptedRefreshToken = token.refresh_token
      ? encryptToken(token.refresh_token)
      : null;

    const user = await prisma.user.upsert({
      where: {
        googleId: userInfo.id,
      },
      create: {
        email: validatedEmail,
        googleId: userInfo.id,
        name: userInfo.name,
        picture: userInfo.picture,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
      },
      update: {
        email: validatedEmail,
        name: userInfo.name,
        picture: userInfo.picture,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
      },
    });

    if (!user) {
      new InvalidCredentialsError();
    }

    const accessToken = app.jwt.sign(
      {
        sub: userInfo.id,
        email: validatedEmail,
        name: userInfo.name,
        picture: userInfo.picture,
      },
      { expiresIn: "1h" },
    );

    const refreshToken = app.jwt.sign(
      { sub: userInfo.id },
      { expiresIn: "7d" },
    );

    // Set both access token and refresh token in cookies
    reply.setCookie("accessToken", accessToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
    });

    reply.setCookie("refreshToken", refreshToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 604800, // 7 days
    });

    // Redirect to frontend (local or production based on environment)
    const frontendUrl =
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL || "http://localhost:3000"
        : "http://localhost:3000";

    return reply.redirect(`${frontendUrl}?token=${accessToken}`);
  } catch (error) {
    console.error("OAuth Error:", error);

    // Se for erro de OAuth, retorna erro específico
    if (error instanceof Error && error.message.includes("OAuth")) {
      return reply.status(401).send({
        message: "Erro de autenticação OAuth",
        error: error.message,
      });
    }

    return reply.status(500).send({
      message: "Erro interno",
      error: error instanceof Error ? error.message : error,
    });
  }
}

function encryptToken(token: string): string {
  const algorithm = "aes-256-gcm";
  const secretKey =
    process.env.ENCRYPTION_SECRET || "fallback-secret-key-change-in-production";
  const key = crypto.scryptSync(secretKey, "salt", 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decryptToken(encryptedToken: string): string {
  const algorithm = "aes-256-gcm";
  const secretKey =
    process.env.ENCRYPTION_SECRET || "fallback-secret-key-change-in-production";
  const key = crypto.scryptSync(secretKey, "salt", 32);

  const [ivHex, authTagHex, encrypted] = encryptedToken.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
