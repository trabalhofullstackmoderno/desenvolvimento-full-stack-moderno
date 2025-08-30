import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify"
import { OAuth2Token } from "@fastify/oauth2"
import { PrismaClient } from "@prisma/client"
import { InvalidCredentialsError } from "@/services/errors/invalid-credentials-error"

const prisma = new PrismaClient()

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

export async function authenticate(
  app: FastifyInstance, 
  request: FastifyRequest, 
  reply: FastifyReply
) {
  try {
    const { token } = (await app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)) as GoogleToken

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    })

    const userInfo = (await userInfoRes.json()) as GoogleUserInfo

    const user = await prisma.user.upsert({
      where: {
        googleId: userInfo.id,
      },
      create: {
        email: userInfo.email,
        googleId: userInfo.id,
        name: userInfo.name,
        picture: userInfo.picture,
      },
      update: {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
    })

    if(!user){
      new InvalidCredentialsError()
    }

    const accessToken = app.jwt.sign(
      {
        sub: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
      { expiresIn: "10m" }
    )

    const refreshToken = app.jwt.sign(
      { sub: userInfo.id },
      { expiresIn: "7d" }
    )

    reply.setCookie("refreshToken", refreshToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return reply.redirect(`http://localhost:3000?token=${accessToken}`)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro interno", error })
  }
}
