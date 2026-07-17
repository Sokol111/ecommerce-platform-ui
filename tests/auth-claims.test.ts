import { createServer, type Server } from 'node:http'
import { exportJWK, generateKeyPair, SignJWT } from 'jose'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { verifyTokenWithConfig } from '../server/utils/auth-claims'

const issuer = 'https://issuer.example/oidc'
const audience = 'https://api.example'
let server: Server
let jwksUrl: string
let signToken: (tokenAudience?: string, includeIssuedAt?: boolean) => Promise<string>

beforeAll(async () => {
  const { privateKey, publicKey } = await generateKeyPair('ES384')
  const publicJwk = await exportJWK(publicKey)
  Object.assign(publicJwk, { alg: 'ES384', kid: 'test-key', use: 'sig' })

  server = createServer((_request, response) => {
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ keys: [publicJwk] }))
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Test JWKS server did not start')
  jwksUrl = `http://127.0.0.1:${address.port}/jwks`

  signToken = (tokenAudience = audience, includeIssuedAt = true) => {
    const token = new SignJWT({ role: 'platform_manager', scope: 'tenants:read' })
      .setProtectedHeader({ alg: 'ES384', kid: 'test-key' })
      .setIssuer(issuer)
      .setAudience(tokenAudience)
      .setSubject('platform-user-1')
      .setExpirationTime('5m')
    if (includeIssuedAt) token.setIssuedAt()
    return token.sign(privateKey)
  }
})

afterAll(() => new Promise<void>((resolve, reject) => {
  server.close((error) => error ? reject(error) : resolve())
}))

describe('verifyTokenWithConfig', () => {
  it('verifies a signed platform token', async () => {
    const claims = await verifyTokenWithConfig(await signToken(), { audience, issuer, jwksUrl })
    expect(claims).toMatchObject({ sub: 'platform-user-1', role: 'platform_manager' })
  })

  it('rejects a token issued for another audience', async () => {
    await expect(verifyTokenWithConfig(await signToken('https://other-api.example'), {
      audience,
      issuer,
      jwksUrl
    })).rejects.toThrow()
  })

  it('rejects a token without an issued-at claim', async () => {
    await expect(verifyTokenWithConfig(await signToken(audience, false), {
      audience,
      issuer,
      jwksUrl
    })).rejects.toThrow()
  })
})
