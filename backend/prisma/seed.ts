import { Blog, PrismaClient, Role, Token, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateRandomKey } from '../src/utils/string';

type UserPayload = Array<
  Omit<User, 'id'> & {
    blogs: Omit<Blog, 'id' | 'authorId'>[];
    tokens: Omit<Token, 'id' | 'authorId'>[];
  }
>;

const data: UserPayload = [
  {
    name: 'User 1',
    username: `test_user_1`,
    email: `test_1@email.com`,
    password: 'password',
    privateKey: generateRandomKey(),
    walletHash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    role: Role.USER,
    isVerified: true,
    blogs: [
      {
        blogTitle: 'Test Blog 1',
        blogDescription: 'This is a test blog',
        dateCreated: new Date('2012-01-01'),
        blogBanner:
          'https://res.cloudinary.com/defendhaiti/image/upload/v1700878367/Upwork/emin-okic/blog-1.jpg'
      },
      {
        blogTitle: 'Test Blog 2',
        blogDescription: 'This is a test blog',
        dateCreated: new Date('2013-02-02'),
        blogBanner:
          'https://res.cloudinary.com/defendhaiti/image/upload/v1700878367/Upwork/emin-okic/blog-2.jpg'
      }
    ],
    tokens: [
      {
        dateMinted: new Date('2012-01-01 00:00:00'),
        title: 'Test Token 1',
        tokenDescription: 'This is a test token',
        tokenImage:
          'https://res.cloudinary.com/defendhaiti/image/upload/v1700878372/Upwork/emin-okic/nft-1.png'
      },
      {
        dateMinted: new Date('2013-02-02 01:01:01'),
        title: 'Test Token 2',
        tokenDescription: 'This is a test token',
        tokenImage:
          'https://res.cloudinary.com/defendhaiti/image/upload/v1700878539/Upwork/emin-okic/nft-2.png'
      }
    ]
  },
  {
    name: 'User 2',
    username: `test_user_2`,
    email: `test_2@email.com`,
    password: 'password',
    privateKey: generateRandomKey(),
    walletHash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
    role: Role.USER,
    isVerified: true,
    blogs: [
      {
        blogTitle: 'Test Blog 3',
        blogDescription: 'This is another test blog',
        dateCreated: new Date('2014-03-03'),
        blogBanner:
          'https://res.cloudinary.com/defendhaiti/image/upload/v1700878367/Upwork/emin-okic/blog-3.jpg'
      }
    ],
    tokens: [
      {
        dateMinted: new Date('2014-03-03 03:03:03'),
        title: 'Test Token 3',
        tokenDescription: 'This is a test token',
        tokenImage:
          'https://res.cloudinary.com/defendhaiti/image/upload/v1700878368/Upwork/emin-okic/nft-3.jpg'
      }
    ]
  },
  {
    name: 'User 3',
    username: `test_user_3`,
    email: `test_3@email.com`,
    password: 'password',
    privateKey: generateRandomKey(),
    walletHash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
    role: Role.USER,
    isVerified: true,
    blogs: [],
    tokens: []
  }
];

(async () => {
  let prisma: PrismaClient | undefined = undefined;

  try {
    const seedingDatabaseUrl = process.env.SEEDING_DATABASE_URL;

    if (!seedingDatabaseUrl) {
      throw new Error(
        "No 'SEEDING_DATABASE_URL' variable was found. Please add one to your environment variables."
      );
    }

    prisma = new PrismaClient({
      datasources: { db: { url: seedingDatabaseUrl } }
    }) as PrismaClient;

    await Promise.all(
      data.map(
        async (payload) =>
          prisma?.user.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
              ...payload,
              password: await bcrypt.hash(payload.password, 12),
              blogs: { create: payload.blogs },
              tokens: { create: payload.tokens }
            }
          })
      )
    );

    // Create admin user
    await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@email.com',
        privateKey: generateRandomKey(),
        password: await bcrypt.hash('password', 12),
        role: Role.ADMIN,
        name: 'Admin User',
        isVerified: true
      }
    });

    console.log('Seeding complete.');
    console.log('--------------------------');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma?.$disconnect();
  }
})();
