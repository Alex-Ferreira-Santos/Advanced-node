import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthenticationService } from '@/data/services'

describe('FacebookAuthenticationService', () => {
  it('should call LoadFacebookUserApi with correct params', async () => {
    const loadFacebookUserByTokenApi = {
      loadUser: jest.fn()
    }
    const sut = new FacebookAuthenticationService(loadFacebookUserByTokenApi)

    await sut.perform({ token: 'any_token' })

    expect(loadFacebookUserByTokenApi.loadUser).toHaveBeenCalledWith({
      token: 'any_token'
    })
    expect(loadFacebookUserByTokenApi.loadUser).toHaveBeenCalledTimes(1)
  })

  it('should return AuthenticationError when LoadFacebookUserApi returns undefined', async () => {
    const loadFacebookUserByTokenApi = {
      loadUser: jest.fn()
    }
    loadFacebookUserByTokenApi.loadUser.mockResolvedValueOnce(undefined)
    const sut = new FacebookAuthenticationService(loadFacebookUserByTokenApi)

    const authResult = await sut.perform({ token: 'any_token' })

    expect(authResult).toEqual(new AuthenticationError())
  })
})
