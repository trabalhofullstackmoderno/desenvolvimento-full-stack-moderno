import fastify from "fastify"
import fastifyCookie from "@fastify/cookie"
import { ZodError } from "zod"
import { env } from "./env"
import fastifyJwt from "@fastify/jwt"
import fastifyOauth2 from "@fastify/oauth2"
import { usersRoutes } from './http/controllers/users/routes'
import fastifyCors from "@fastify/cors";

export const app = fastify()

app.register(fastifyCookie)

app.register(fastifyCors, {
  origin: "http://localhost:3000",
  credentials: true,
});

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

app.register(usersRoutes)

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
    // TODO: integrar com DataDog/Sentry/etc
  }

  return reply.status(500).send({ message: "Internal server error." })
})
