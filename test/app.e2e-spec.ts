import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();

    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const authDto: AuthDto = {
      email: 'testjest@gamil.com',
      password: '123456',
    };

    describe('Signup', () => {
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: authDto.email,
          })
          .expectStatus(400);
      });

      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: authDto.password,
          })
          .expectStatus(400);
      });

      it('should throw if both empty', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(authDto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: authDto.email,
          })
          .expectStatus(400);
      });

      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: authDto.password,
          })
          .expectStatus(400);
      });

      it('should throw if both empty', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(authDto)
          .expectStatus(200)
          .stores('userAt', 'token');
      });
    });
  });

  describe('Users', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      const editUserDto: EditUserDto = {
        firstName: 'testFirstName',
        lastName: 'testLastName',
      };

      it('should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .withBody(editUserDto)
          .expectBodyContains(editUserDto.lastName)
          .expectBodyContains(editUserDto.firstName)
          .expectStatus(200);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get all empty bookmark', () => {
      it('should get all a empty list of bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .expectBody([])
          .expectStatus(200);
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First bookmark',
        link: 'https://www.youtube.com/watch?v=GHTA143_b-s&t=11863s',
      };

      it('should create a bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get all bookmark', () => {
      it('should get all bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get one bookmark by id', () => {
      it('should get one bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .expectStatus(200)
          .expectBodyContains(`$S{bookmarkId}`);
      });
    });

    describe('Edit bookmark', () => {
      const editBookmarkDto: EditBookmarkDto = {
        title: 'First bookmark edited',
        description: 'Edited bookmark',
      };
      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .withBody(editBookmarkDto)
          .expectStatus(200)
          .expectBodyContains(`$S{bookmarkId}`)
          .expectBodyContains(editBookmarkDto.title)
          .expectBodyContains(editBookmarkDto.description);
      });
    });

    describe('Delete bookmark', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .expectStatus(204);
      });

      it('should get all a empty list of bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders('Authorization', `Bearer $S{userAt}`)
          .expectBody([])
          .expectStatus(200);
      });
    });
  });
});
