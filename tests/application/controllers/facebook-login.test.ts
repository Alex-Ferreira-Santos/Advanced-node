import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthentication } from '@/domain/features'
import { AccessToken } from '@/domain/models'
import { MockProxy, mock } from 'jest-mock-extended'
import { FacebookLoginController } from '@/application/controllers'
import {
  RequiredFieldError,
  ServerError,
  UnauthorizedError
} from '@/application/errors'
import { RequiredStringValidator } from '@/application/validation'

jest.mock('@/application/validation/required-string')

describe('FacebookLoginController', () => {
  let sut: FacebookLoginController
  let facebookAuth: MockProxy<FacebookAuthentication>
  let token: string

  beforeAll(() => {
    facebookAuth = mock()
    facebookAuth.perform.mockResolvedValue(new AccessToken('any_value'))
    token = 'any_token'
  })

  beforeEach(() => {
    sut = new FacebookLoginController(facebookAuth)
  })
  it('should return 400 if validation fails', async () => {
    const error = new RequiredFieldError('token')
    const RequiredStringValidatorSpy = jest.fn().mockImplementationOnce(() => ({
      validate: jest.fn().mockReturnValueOnce(error)
    }))
    jest
      .mocked(RequiredStringValidator)
      .mockImplementation(RequiredStringValidatorSpy)

    const httpResponse = await sut.handle({ token })

    expect(RequiredStringValidator).toHaveBeenCalledWith('any_token', 'token')

    expect(httpResponse).toEqual({
      statusCode: 400,
      data: error
    })
  })

  it('should call facebook authentication with corret params', async () => {
    await sut.handle({ token: 'any_token' })
    expect(facebookAuth.perform).toHaveBeenCalledWith({
      token
    })
    expect(facebookAuth.perform).toHaveBeenCalledTimes(1)
  })

  it('should return 401 if authentication fails', async () => {
    facebookAuth.perform.mockResolvedValueOnce(new AuthenticationError())
    const httpResponse = await sut.handle({ token })
    expect(httpResponse).toEqual({
      statusCode: 401,
      data: new UnauthorizedError()
    })
  })

  it('should return 200 if authentication succeeds', async () => {
    const httpResponse = await sut.handle({ token })
    expect(httpResponse).toEqual({
      statusCode: 200,
      data: {
        accessToken: 'any_value'
      }
    })
  })

  it('should return 500 if authentication throws', async () => {
    const error = new Error('infra_error')
    facebookAuth.perform.mockRejectedValueOnce(error)
    const httpResponse = await sut.handle({ token })
    expect(httpResponse).toEqual({
      statusCode: 500,
      data: new ServerError()
    })
  })
})
