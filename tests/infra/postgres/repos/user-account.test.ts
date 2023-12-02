import { LoadUserAccountRepository } from '@/data/contracts/repos'
import { newDb } from 'pg-mem'
import { Column, Entity, PrimaryGeneratedColumn, getRepository } from 'typeorm'

class PgUserAccountRepository implements LoadUserAccountRepository {
  // constructor(private readonly dataSource: DataSource) {}

  async load(
    params: LoadUserAccountRepository.Params
  ): Promise<LoadUserAccountRepository.Result> {
    const pgUserRepo = getRepository(PgUser)
    const pgUser = await pgUserRepo.findOne({ where: { email: params.email } })
    if (pgUser !== undefined) {
      return {
        id: pgUser.id?.toString(),
        name: pgUser?.name ?? undefined
      }
    }
  }
}

@Entity({ name: 'usuarios' })
class PgUser {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ nullable: true, name: 'nome' })
  name?: string

  @Column()
  email!: string

  @Column({ nullable: true, name: 'id_facebook' })
  facebookId?: number
}

describe('PgUserAccountRepository', () => {
  describe('load', () => {
    let sut: PgUserAccountRepository
    beforeAll(() => {})

    beforeEach(async () => {
      sut = new PgUserAccountRepository()
    })
    it('should return an account if email exists', async () => {
      const db = newDb({ autoCreateForeignKeyIndices: true })
      const connection = await db.adapters.createTypeormConnection({
        type: 'postgres',
        entities: [PgUser]
      })
      await connection.synchronize()
      const pgUserRepo = connection.getRepository(PgUser)
      await pgUserRepo.save({ email: 'existing_email' })

      const account = await sut.load({ email: 'existing_email' })

      expect(account).toEqual({ id: '1' })
      await connection.close()
    })

    it('should return undefined if email does not exists', async () => {
      const db = newDb({ autoCreateForeignKeyIndices: true })
      const connection = await db.adapters.createTypeormConnection({
        type: 'postgres',
        entities: [PgUser]
      })
      await connection.synchronize()

      const account = await sut.load({ email: 'new_email' })

      expect(account).toBeUndefined()
    })
  })
})
