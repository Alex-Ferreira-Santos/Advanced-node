import jwt from 'jsonwebtoken'
import { JwtTokenGenerator } from '@/infra/crypto'

jest.mock('jsonwebtoken')

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

  it('should rethrow if sign throws', async () => {
    fakeJwt.sign.mockImplementationOnce(() => {
      throw new Error('token_error')
    })

    const promise = sut.generateToken({
      expirationInMs: 1000,
      key: 'any_key'
    })

    await expect(promise).rejects.toThrow(new Error('token_error'))
  })
})
