import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyOauth2 from "@fastify/oauth2";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastify from "fastify";
import {
  jsonSchemaTransform
} from "fastify-type-provider-zod";
import { ZodError } from "zod";
import { env } from "./env";
import { chatRoutes } from "./http/controllers/chat/routes";
import { pushRoutes } from "./http/controllers/push/routes";
import { usersRoutes } from "./http/controllers/users/routes";
import { WebSocketService } from "./services/websocket-service";
export const app = fastify();

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'API de Exemplo',
      description: 'Documentação da API de exemplo utilizando Fastify',
      version: '1.0.0',
    },
  },
  // Importante adicionar para fazer o parse do schema
  transform: jsonSchemaTransform
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs'
})



app.register(fastifyCookie);

app.register(fastifyCors, {
  origin: "http://localhost:3000",
  credentials: true,
});

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: "accessToken",
    signed: false,
  },
  sign: {
    expiresIn: "1h",
  },
});

app.register(fastifyOauth2, {
  name: "googleOAuth2",
  scope: [
    "profile",
    "email",
    "https://www.googleapis.com/auth/contacts.readonly",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
  ],
  credentials: {
    client: {
      id: env.GOOGLE_CLIENT_ID,
      secret: env.GOOGLE_CLIENT_SECRET,
    },
    auth: fastifyOauth2.GOOGLE_CONFIGURATION,
  },
  startRedirectPath: "/login/google",
  callbackUri: env.GOOGLE_CALLBACK_URL,
});

// Authentication middleware
app.decorate("authenticate", async function (request: any, reply: any) {
  try {
    // Try to verify JWT from cookie first
    await request.jwtVerify();
  } catch (cookieErr) {
    // If cookie fails, try Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const decoded = app.jwt.verify(token);
        request.user = decoded;
      } catch (headerErr) {
        return reply.status(401).send({
          message: "Authentication required",
          code: "UNAUTHORIZED",
        });
      }
    } else {
      return reply.status(401).send({
        message: "Authentication required",
        code: "UNAUTHORIZED",
      });
    }
  }
});

// Setup WebSocket (async)
app.register(async function (fastify) {
  try {
    const wsService = WebSocketService.getInstance()
    await wsService.setupWebSocket(fastify)
  } catch (error) {
    console.error('Failed to initialize WebSocket service:', error)
    // Continue without WebSocket if it fails
  }
})

app.register(usersRoutes);
app.register(chatRoutes);
app.register(pushRoutes);

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation error",
      issues: error.format(),
    });
  }

  if (env.NODE_ENV !== "production") {
    console.error(error);
  } else {
    // TODO: integrar com DataDog/Sentry/etc
  }

  return reply.status(500).send({ message: "Internal server error." });
});
