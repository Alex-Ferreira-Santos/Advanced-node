import { LoadFacebookUserApi } from '@/data/contracts/apis'
import {
  LoadUserAccountRepository,
  SaveFacebookAccountRepository
} from '@/data/contracts/repos'
import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthentication } from '@/domain/features'
import { AccessToken, FacebookAccount } from '@/domain/models'
import { TokenGenerator } from '@/data/contracts/crypto'

export class FacebookAuthenticationService implements FacebookAuthentication {
  constructor(
    private readonly facebookUserApi: LoadFacebookUserApi,
    private readonly userAccountRepo: LoadUserAccountRepository &
      SaveFacebookAccountRepository,
    private readonly crypto: TokenGenerator
  ) {}

  async perform(
    params: FacebookAuthentication.Params
  ): Promise<FacebookAuthentication.Result> {
    const fbData = await this.facebookUserApi.loadUser(params)
    if (fbData !== undefined) {
      const accountData = await this.userAccountRepo.load({
        email: fbData?.email
      })
      const facebookAccount = new FacebookAccount(fbData, accountData)

      const { id } = await this.userAccountRepo.saveWithFacebook(
        facebookAccount
      )

      const token = await this.crypto.generateToken({
        key: id,
        expirationInMs: AccessToken.expirationInMs
      })

      return new AccessToken(token)
    }
    return new AuthenticationError()
  }
}
