import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify"
import { OAuth2Token } from "@fastify/oauth2"

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
    const token = (await app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)) as GoogleToken

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    })

    const userInfo = (await userInfoRes.json()) as GoogleUserInfo

    console.log(userInfo)

    return reply.redirect(`http://localhost:3000`)
  } catch (error) {
    console.error(error)
    return reply.status(500).send({ message: "Erro interno", error })
  }
}
