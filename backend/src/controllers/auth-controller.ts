import { TokenType, User, UserToken } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '~/server';
import AuthError from '~/errors/auth-error';
import BadRequestError from '~/errors/bad-request-error';
import NotFoundError from '~/errors/not-found-error';
import JWT from '~/utils/jwt';
import { pick } from '~/utils/object';
import { withErrorCatcher } from '~/utils/app';
import validator from 'validator';
import { sendEmail } from '~/utils/mailer';
import crypto from 'crypto';
import { generateRandomKey, hash } from '~/utils/string';
import { TOKEN_AGES } from '~/utils/constants';
import assert from 'assert';

type MailingEndpointDetails = {
  uri: string;
};

type RegistrationUserDetails = MailingEndpointDetails & {
  name?: string;
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

type LoginCredentials = {
  email?: string;
  username?: string;
  password: string;
};

type ForgotPasswordDetails = MailingEndpointDetails & {
  username?: string;
  email?: string;
};

type ResetPasswordDetails = MailingEndpointDetails & {
  username: string;
  token: string;
  password: string;
  passwordConfirmation: string;
};

type VerifyEmailDetails = {
  username: string;
  token: string;
};

const USERNAME_REGEX = /^[a-z0-9_]{6,12}$/i;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const register = withErrorCatcher<unknown, unknown, RegistrationUserDetails>(
  async (req, res) => {
    let { name = '', uri, username, email, password, passwordConfirmation } = req.body;

    const requiredKeys = ['username', 'email', 'password', 'passwordConfirmation', 'uri'] as const;
    username = username?.trim();
    email = email?.trim();
    password = password?.trim();
    passwordConfirmation = passwordConfirmation?.trim();
    uri = uri?.trim();

    const missingValues = requiredKeys.filter((key) => req.body[key] === undefined);

    if (missingValues.length) {
      throw new BadRequestError(
        `The following parameters are required: ${missingValues.join(', ')}`
      );
    }

    if (!validator.isEmail(email)) {
      throw new BadRequestError('Invalid email format.');
    }

    if (!USERNAME_REGEX.test(username)) {
      throw new BadRequestError(
        'Invalid username format. Usernames can only contain numbers, letters, and underscore character.'
      );
    }

    if (passwordConfirmation !== password) {
      throw new BadRequestError("'password' and 'passwordConfirmation' do not match");
    }

    if (!PASSWORD_REGEX.test(password)) {
      throw new BadRequestError(
        'Password must be at least 8 characters long and include a number, uppercase letter, lowercase letter, and a symbol.'
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    });

    if (existingUser) {
      const duplicateField = existingUser.email === email ? 'email' : 'username';
      throw new AuthError(`A user with this ${duplicateField} already exists.`);
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 12);
    const privateKey = generateRandomKey();
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        privateKey,
        password: hashedPassword
      }
    });

    // Create the access & refresh tokens
    const refreshToken = await createAndStoreToken(user, 'REFRESH_TOKEN');
    const accessToken = buildJwtToken(user);

    res
      .status(201)
      .cookie('refreshToken', refreshToken, httpOnlyCookie({ maxAge: TOKEN_AGES.REFRESH_TOKEN }))
      .json(buildUserResponse(user, { accessToken }));

    // Send verification token via email
    const verificationToken = await createAndStoreToken(user, 'VERIFICATION_TOKEN');
    await sendVerificationToken({ token: verificationToken, user, uri });
  }
);

export const login = withErrorCatcher<unknown, unknown, LoginCredentials>(async (req, res) => {
  const { username, email, password } = req.body;

  const queryField = username ? 'username' : 'email';
  const queryValue = username ?? email;

  if (!queryValue) {
    throw new BadRequestError('At least one of the username or email is required to sign in.');
  }

  if (queryField === 'email' && !validator.isEmail(queryValue)) {
    throw new BadRequestError('Invalid email format.');
  }

  const user = await prisma.user.findFirst({
    where: { [queryField]: queryValue }
  });
  if (!user) {
    throw new NotFoundError(`No user with this ${queryField} was found.`);
  }

  // Authenticate credentials
  const passwordsMatch = await bcrypt.compare(password, user.password);
  if (!passwordsMatch) {
    throw new AuthError('Incorrect password.');
  }

  // Create new access & refresh tokens
  const refreshToken = await createAndStoreToken(user, 'REFRESH_TOKEN');
  const accessToken = buildJwtToken(user);

  res
    .status(200)
    .cookie('refreshToken', refreshToken, httpOnlyCookie({ maxAge: TOKEN_AGES.REFRESH_TOKEN }))
    .json(buildUserResponse(user, { accessToken }));
});

export const logout = withErrorCatcher(async (req, res) => {
  const verifiedAccessToken = req.verifiedAccessToken;
  console.log({ verifiedAccessToken });
  if (!verifiedAccessToken) throw new AuthError('Invalid access token');

  const { refreshToken } = req.cookies;
  const decodedToken = JWT.decode(verifiedAccessToken);

  console.log({ token: hash(refreshToken, 'sha256') });

  // Delete the userToken record pertaining to this refreshToken
  await prisma.userToken.deleteMany({
    where: {
      OR: [
        {
          userId: decodedToken.userId,
          token: hash(refreshToken, 'sha256'),
          tokenType: 'REFRESH_TOKEN'
        },
        {
          userId: decodedToken.userId,
          expTime: { lte: new Date(Date.now()) }
        }
      ]
    }
  });

  // Clear cookie and send okay response
  res.cookie('refreshToken', '', httpOnlyCookie({ maxAge: 0 })).sendStatus(200);
});

export const forgotPassword = withErrorCatcher<unknown, unknown, ForgotPasswordDetails>(
  async (req, res) => {
    const { username, email, uri } = req.body;

    const queryField = username ? 'username' : 'email';
    const queryValue = username ?? email;

    if (!queryValue) {
      throw new BadRequestError('At least one of the username or email is required to sign in.');
    }

    if (queryField === 'email' && !validator.isEmail(queryValue)) {
      throw new BadRequestError('Invalid email format.');
    }

    if (!uri) {
      throw new BadRequestError('No URI provided.');
    }

    const user = await prisma.user.findFirst({
      where: { [queryField]: queryValue }
    });

    if (!user) {
      throw new NotFoundError(`Could not find user with ${queryField} '${queryValue}'`);
    }

    const token = await createAndStoreToken(user, 'RESET_TOKEN');
    // TODO Use a proper HTML template and update this email
    await sendEmail({
      to: user.email,
      subject: 'Reset Password',
      htmlContent: `
        <div>
          <h1 style="font-weight: 400;">Did you forget your password?</h1>
          <div style="font-size: 16px">
            <p>You are receiving this email because we received a password reset request for your account.</p>
            <p>
              To reset your password, 
              <a style="font-weight: 600; color: hotpink;" href="${uri}?username=${user.username}&token=${token}">Click Here</a>
            </p>
            <p>If you did not request a password reset, you can safely ignore this email.</p>
          </div>
        </div>
      `
    });

    res.sendStatus(200);
  }
);

export const resetPassword = withErrorCatcher<unknown, unknown, ResetPasswordDetails>(
  async (req, res) => {
    const { token, username, password, passwordConfirmation } = req.body;

    if (!password || !passwordConfirmation || !token || !username) {
      throw new BadRequestError('Missing parameters');
    }

    // Compare passwords
    if (password !== passwordConfirmation) {
      throw new BadRequestError("'password' and 'passwordConfirmation' do not match.");
    }

    // Hash the incoming token
    const hashedToken = hash(token, 'sha256');

    // Fetch the user with the provided token
    const user = await prisma.user.findFirst({
      where: {
        username,
        userTokens: {
          some: {
            tokenType: 'RESET_TOKEN',
            token: hashedToken,
            expTime: { gt: new Date(Date.now()) }
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundError('Reset token is invalid, or user does not exist.');
    }

    // Update the user's password
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      // Clear all previous tokens
      prisma.userToken.deleteMany({
        where: { userId: user.id }
      }),
      // Update password
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      })
    ]);

    const refreshToken = await createAndStoreToken(user, 'REFRESH_TOKEN');
    const accessToken = buildJwtToken(user);

    res
      .status(201)
      .cookie('refreshToken', refreshToken, httpOnlyCookie({ maxAge: TOKEN_AGES.REFRESH_TOKEN }))
      .json(buildUserResponse(user, { accessToken }));
  }
);

export const requestVerificationToken = withErrorCatcher<unknown, unknown, MailingEndpointDetails>(
  async (req, res) => {
    const { verifiedAccessToken } = req;
    if (!verifiedAccessToken) throw new AuthError('Invalid access token');

    const { uri } = req.body;
    if (!uri) throw new BadRequestError("Missing 'uri' parameter.");

    const user = await prisma.user.findFirst({
      where: {
        id: JWT.decode(verifiedAccessToken).userId
      }
    });

    if (!user) {
      throw new AuthError('Invalid access token');
    }

    const verificationToken = await createAndStoreToken(user, 'VERIFICATION_TOKEN');
    await sendVerificationToken({ token: verificationToken, user, uri });

    res.sendStatus(200);
  }
);

export const verifyEmail = withErrorCatcher<unknown, unknown, VerifyEmailDetails>(
  async (req, res) => {
    const { verifiedAccessToken } = req;
    if (!verifiedAccessToken) throw new AuthError('Invalid access token');

    const { token: verificationToken, username } = req.body;
    const hashedToken = hash(verificationToken, 'sha256');

    const user = await prisma.user.findFirst({
      where: {
        id: JWT.decode(verifiedAccessToken).userId
      }
    });

    if (!user) {
      throw new AuthError('Invalid access token');
    }

    // The access token processed to get here is not for the email being verified
    if (username !== user.username) {
      throw new AuthError('Invalid access token.');
    }

    const tokenRecord = await prisma.userToken.findFirst({
      where: { userId: user.id, token: hashedToken, tokenType: 'VERIFICATION_TOKEN' }
    });

    if (!tokenRecord) {
      throw new AuthError('Invalid verification token.');
    }

    const [, updatedUser] = await prisma.$transaction([
      // Clear verification token
      prisma.userToken.deleteMany({
        where: { userId: user.id, tokenType: 'VERIFICATION_TOKEN' }
      }),
      // Update verification status
      prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true }
      })
    ]);

    res.status(201).json(buildUserResponse(updatedUser));
  }
);

export const refreshAccessToken = withErrorCatcher<unknown, unknown, { accessToken: string }>(
  async (req, res) => {
    const { refreshToken } = req.cookies;
    let { accessToken } = req.body;

    if (!accessToken) {
      throw new BadRequestError('Invalid accessToken');
    }

    if (!refreshToken) {
      throw new AuthError('Invalid refresh token');
    }

    const decodedToken = JWT.decode(accessToken);

    const user = await prisma.user.findFirst({
      where: {
        id: decodedToken.userId,
        userTokens: {
          some: { token: hash(refreshToken, 'sha256'), tokenType: 'REFRESH_TOKEN' }
        }
      },
      include: {
        userTokens: { select: { id: true } }
      }
    });

    if (!user) {
      throw new AuthError('Invalid refresh token');
    }

    try {
      await prisma.userToken.delete({
        where: { id: user.userTokens[0].id }
      });
    } catch (e) {
      console.error(`Failed to delete token with id: ${user.userTokens[0].id}`);
      console.error(e);
    }

    const newRefreshToken = await createAndStoreToken(user, 'REFRESH_TOKEN');
    accessToken = buildJwtToken(user);

    res
      .status(200)
      .cookie('refreshToken', newRefreshToken, httpOnlyCookie({ maxAge: TOKEN_AGES.REFRESH_TOKEN }))
      .json(buildUserResponse(user, { accessToken }));
  }
);

export const currentUser = withErrorCatcher(async (req, res) => {
  const verifiedAccessToken = req.verifiedAccessToken;
  if (!verifiedAccessToken) throw new AuthError('Invalid access token');

  const decodedToken = JWT.decode(verifiedAccessToken);

  const user = await prisma.user.findUnique({
    where: {
      id: decodedToken.userId
    }
  });

  if (!user) {
    throw new NotFoundError(`Could not find user with id ${decodedToken.userId}`);
  }

  res.status(200).json(buildUserResponse(user));
});

/*******************************************
 *            HELPER FUNCTIONS             *
 *******************************************/

async function createAndStoreToken(user: User, tokenType: TokenType) {
  assert(tokenType !== 'ACCESS_TOKEN', 'No need to store access tokens.');

  const rawToken = crypto.randomBytes(24).toString('base64url');
  const token = hash(rawToken, 'sha256');
  const expTime = new Date(Date.now() + TOKEN_AGES[tokenType]);

  await prisma.userToken.create({
    data: {
      token,
      tokenType,
      expTime,
      userId: user.id
    }
  });

  return rawToken;
}

export function buildUserResponse(user: User, responseData: Record<string, unknown> = {}) {
  return {
    data: {
      ...responseData,
      user: pick(user, ['id', 'name', 'username', 'email', 'role', 'isVerified'])
    }
  };
}

function buildJwtToken(user: User) {
  return JWT.sign({
    userId: user.id,
    ...pick(user, ['email', 'username', 'isVerified', 'role'])
  });
}

type SendVerificationTokenParams = {
  uri: string;
  token: string;
  user: User;
};

async function sendVerificationToken({ uri, token, user }: SendVerificationTokenParams) {
  // TODO Use a proper HTML template and update this email
  await sendEmail({
    to: user.email,
    subject: 'Verify Email',
    htmlContent: `
        <div>
          <h1 style="font-weight: 400; text-align: center;">Welcome to NFT Marketplace!</h1>
          <p style="font-size: 16px">
            In order to verify your email, please
            <a style="font-weight: 600; color: hotpink;" href="${uri}?username=${user.username}&token=${token}">Click Here</a>
          </p>
        </div>
      `
  });
}

function httpOnlyCookie({ maxAge }: { maxAge: number }) {
  return {
    httpOnly: true,
    withCredentials: true,
    maxAge: maxAge,
    sameSite: 'lax'
  } as const;
}
