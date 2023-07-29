import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthenticationService } from '@/data/services'
import { mock, MockProxy } from 'jest-mock-extended'
import { LoadFacebookUserApi } from '@/data/contracts/apis'
import {
  LoadUserAccountRepository,
  SaveFacebookAccountRepository
} from '@/data/contracts/repos'
import { FacebookAccount } from '@/domain/models/facebook-account'
import { TokenGenerator } from '@/data/contracts/crypto'
import { AccessToken } from '@/domain/models'

jest.mock('@/domain/models/facebook-account')
const mockedFbAccount = FacebookAccount as jest.Mock

describe('FacebookAuthenticationService', () => {
  let facebookUserApi: MockProxy<LoadFacebookUserApi>
  let crypto: MockProxy<TokenGenerator>
  let userAccountRepo: MockProxy<
    LoadUserAccountRepository & SaveFacebookAccountRepository
  >
  let sut: FacebookAuthenticationService
  const token = 'any_token'

  beforeEach(() => {
    facebookUserApi = mock()
    facebookUserApi.loadUser.mockResolvedValue({
      name: 'any_fb_name',
      email: 'any_fb_email',
      facebookId: 'any_fb_Id'
    })
    crypto = mock()
    crypto.generateToken.mockResolvedValue('any_generated_token')
    userAccountRepo = mock()
    userAccountRepo.load.mockResolvedValue(undefined)
    userAccountRepo.saveWithFacebook.mockResolvedValue({ id: 'any_account_id' })
    sut = new FacebookAuthenticationService(
      facebookUserApi,
      userAccountRepo,
      crypto
    )
  })

  it('should call LoadFacebookUserApi with correct params', async () => {
    await sut.perform({ token })

    expect(facebookUserApi.loadUser).toHaveBeenCalledWith({
      token
    })
    expect(facebookUserApi.loadUser).toHaveBeenCalledTimes(1)
  })

  it('should return AuthenticationError when LoadFacebookUserApi returns undefined', async () => {
    facebookUserApi.loadUser.mockResolvedValueOnce(undefined)

    const authResult = await sut.perform({ token })

    expect(authResult).toEqual(new AuthenticationError())
  })

  it('should call loadUserAccountRepo when LoadFacebookUserApi returns data', async () => {
    await sut.perform({ token })

    expect(userAccountRepo.load).toHaveBeenCalledWith({
      email: 'any_fb_email'
    })
    expect(userAccountRepo.load).toHaveBeenCalledTimes(1)
  })

  it('should call SaveFacebookAccountRepository with FacebookAccount', async () => {
    mockedFbAccount.mockImplementation(() => ({
      any: 'any'
    }))
    await sut.perform({ token })

    expect(userAccountRepo.saveWithFacebook).toHaveBeenCalledWith({
      any: 'any'
    })
    expect(userAccountRepo.saveWithFacebook).toHaveBeenCalledTimes(1)
  })

  it('should call TokenGenerator with correct params', async () => {
    await sut.perform({ token })

    expect(crypto.generateToken).toHaveBeenCalledWith({
      key: 'any_account_id',
      expirationInMs: AccessToken.expirationInMs
    })
    expect(crypto.generateToken).toHaveBeenCalledTimes(1)
  })

  it('should return an AccessToken on success', async () => {
    const authResult = await sut.perform({ token })

    expect(crypto.generateToken).toHaveBeenCalledWith({
      key: 'any_account_id',
      expirationInMs: AccessToken.expirationInMs
    })
    expect(authResult).toEqual(new AccessToken('any_generated_token'))
  })

  it('should rethrow if LoadFacebookUserApi throws', async () => {
    facebookUserApi.loadUser.mockRejectedValueOnce(new Error('fb_error'))

    const promise = sut.perform({ token })

    await expect(promise).rejects.toThrow(new Error('fb_error'))
  })

  it('should rethrow if LoadUserAccountRepo throws', async () => {
    userAccountRepo.load.mockRejectedValueOnce(new Error('load_error'))

    const promise = sut.perform({ token })

    await expect(promise).rejects.toThrow(new Error('load_error'))
  })

  it('should rethrow if SaveWithFacebook throws', async () => {
    userAccountRepo.saveWithFacebook.mockRejectedValueOnce(new Error('save_error'))

    const promise = sut.perform({ token })

    await expect(promise).rejects.toThrow(new Error('save_error'))
  })

  it('should rethrow if TokenGenerator throws', async () => {
    crypto.generateToken.mockRejectedValueOnce(new Error('token_error'))

    const promise = sut.perform({ token })

    await expect(promise).rejects.toThrow(new Error('token_error'))
  })
})
