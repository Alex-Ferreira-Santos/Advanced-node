import { FacebookAccount } from '@/domain/models'

describe('FacebookAccount', () => {
  it('should create with facebook data only', () => {
    const sut = new FacebookAccount({
      name: 'any_fb_name',
      email: 'any_fb_email',
      facebookId: 'any_fb_facebookId'
    })

    expect(sut).toEqual({
      name: 'any_fb_name',
      email: 'any_fb_email',
      facebookId: 'any_fb_facebookId'
    })
  })

  it('should update name if its empty', () => {
    const accountData = {
      id: 'any_id'
    }
    const sut = new FacebookAccount(
      {
        name: 'any_fb_name',
        email: 'any_fb_email',
        facebookId: 'any_fb_facebookId'
      },
      accountData
    )

    expect(sut).toEqual({
      id: 'any_id',
      name: 'any_fb_name',
      email: 'any_fb_email',
      facebookId: 'any_fb_facebookId'
    })
  })

  it('should not update name if its not empty', () => {
    const accountData = {
      id: 'any_id',
      name: 'any_name'
    }
    const sut = new FacebookAccount(
      {
        name: 'any_fb_name',
        email: 'any_fb_email',
        facebookId: 'any_fb_facebookId'
      },
      accountData
    )

    expect(sut).toEqual({
      id: 'any_id',
      name: 'any_name',
      email: 'any_fb_email',
      facebookId: 'any_fb_facebookId'
    })
  })
})
