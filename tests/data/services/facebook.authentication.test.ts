import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthenticationService } from '@/data/services'
import { mock, MockProxy } from 'jest-mock-extended'
import { LoadFacebookUserApi } from '@/data/contracts/apis'
import { LoadUserAccountRepository } from '@/data/contracts/repos'

describe('FacebookAuthenticationService', () => {
  let loadFacebookUserApi: MockProxy<LoadFacebookUserApi>
  let loadUserAccountRepo: MockProxy<LoadUserAccountRepository>
  let sut: FacebookAuthenticationService
  const token = 'any_token'

  beforeEach(() => {
    loadFacebookUserApi = mock()
    loadFacebookUserApi.loadUser.mockResolvedValue({
      name: 'any_fb_name',
      email: 'any_fb_email',
      facebookId: 'any_fb_Id'
    })
    loadUserAccountRepo = mock()
    sut = new FacebookAuthenticationService(
      loadFacebookUserApi,
      loadUserAccountRepo
    )
  })

  it('should call LoadFacebookUserApi with correct params', async () => {
    await sut.perform({ token })

    expect(loadFacebookUserApi.loadUser).toHaveBeenCalledWith({
      token
    })
    expect(loadFacebookUserApi.loadUser).toHaveBeenCalledTimes(1)
  })

  it('should return AuthenticationError when LoadFacebookUserApi returns undefined', async () => {
    loadFacebookUserApi.loadUser.mockResolvedValueOnce(undefined)

    const authResult = await sut.perform({ token })

    expect(authResult).toEqual(new AuthenticationError())
  })

  it('should call loadUserAccountRepo when LoadFacebookUserApi returns data', async () => {
    await sut.perform({ token })

    expect(loadUserAccountRepo.load).toHaveBeenCalledWith({
      email: 'any_fb_email'
    })
    expect(loadUserAccountRepo.load).toHaveBeenCalledTimes(1)
  })
})