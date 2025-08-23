import fastify from "fastify"
import fastifyCookie from "@fastify/cookie"
import { ZodError } from "zod"
import { env } from "../../env"
import fastifyJwt from "@fastify/jwt"
import fastifyOauth2, { OAuth2Token } from "@fastify/oauth2"

export const app = fastify()

// ---------- Types ----------
interface GoogleToken extends OAuth2Token {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  id_token?: string
}

interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture: string
}

// ---------- JWT config ----------
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: "refreshToken",
    signed: false,
  },
  sign: {
    expiresIn: "10m",
  },
})

// ---------- Cookies ----------
app.register(fastifyCookie)

// ---------- Google OAuth2 ----------
app.register(fastifyOauth2, {
  name: "googleOAuth2",
  scope: ["profile", "email"],
  credentials: {
    client: {
      id: env.GOOGLE_CLIENT_ID,
      secret: env.GOOGLE_CLIENT_SECRET,
    },
    auth: fastifyOauth2.GOOGLE_CONFIGURATION,
  },
  startRedirectPath: "/login/google",
  callbackUri: "http://localhost:3333/login/google/callback",
})

// ---------- Callback do Google ----------
app.get("/login/google/callback", async function (request, reply) {
  const token = (await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
    request
  )) as GoogleToken

  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  })
  const userInfo = (await userInfoRes.json()) as GoogleUserInfo

  const jwt = app.jwt.sign(
    {
      sub: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    },
    { expiresIn: "1h" }
  )

  reply.setCookie("refreshToken", jwt, {
    httpOnly: true,
    path: "/",
    secure: env.NODE_ENV === "production",
  })

  return reply.redirect(`http://localhost:3000?token=${jwt}`)
})

// ---------- Error handler ----------
app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error",
      issues: error.format(),
    })
  }

  if (env.NODE_ENV !== "production") {
    console.error(error)
  } else {
    // TODO: logar em ferramenta externa tipo DataDog/NewRelic/Sentry
  }

  return reply.status(500).send({ message: "Internal server error." })
})
