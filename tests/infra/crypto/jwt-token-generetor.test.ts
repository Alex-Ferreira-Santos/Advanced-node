import { TokenGenerator } from '@/data/contracts/crypto'
import jwt from 'jsonwebtoken'

jest.mock('jsonwebtoken')

class JwtTokenGenerator {
  constructor(private readonly secret: string) {}

  async generateToken(
    params: TokenGenerator.Params
  ): Promise<TokenGenerator.Result> {
    const expirationInSeconds = params.expirationInMs / 1000
    return jwt.sign({ key: params.key }, this.secret, {
      expiresIn: expirationInSeconds
    })
  }
}
describe('JwtTokenGenerator', () => {
  let sut: JwtTokenGenerator
  let fakeJwt: jest.Mocked<typeof jwt>
  let secret: string

  beforeAll(() => {
    fakeJwt = jwt as jest.Mocked<typeof jwt>
    secret = 'any_secret'
    fakeJwt.sign.mockImplementation(() => 'any_token')
  })

  beforeEach(() => {
    sut = new JwtTokenGenerator(secret)
  })

  it('should call sign with corret params', async () => {
    await sut.generateToken({ expirationInMs: 1000, key: 'any_key' })

    expect(fakeJwt.sign).toHaveBeenCalledWith({ key: 'any_key' }, secret, {
      expiresIn: 1
    })
  })

  it('should return a token', async () => {
    const token = await sut.generateToken({
      expirationInMs: 1000,
      key: 'any_key'
    })

    expect(token).toBe('any_token')
  })
})
