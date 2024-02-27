import AuthError from '~/errors/auth-error';
import BadRequestError from '~/errors/bad-request-error';
import NotFoundError from '~/errors/not-found-error';
import { prisma } from '~/server';
import { withErrorCatcher } from '~/utils/app';
import JWT from '~/utils/jwt';

type UserParams = {
  username: string;
};

type UserContentParams = UserParams & {
  contentType: 'tokens' | 'blogs';
};

type UserContentRecordParams = UserContentParams & {
  id: string;
};

export const profile = withErrorCatcher<UserParams>(async (req, res) => {
  const { username } = req.params;
  const { verifiedAccessToken } = req;

  if (!verifiedAccessToken) {
    throw new AuthError('Invalid access token');
  }

  const userProfile = await prisma.user.findFirst({
    where: { username, id: JWT.decode(verifiedAccessToken).userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      isVerified: true,
      blogs: true,
      tokens: true
    }
  });

  if (!userProfile) {
    throw new NotFoundError(`Could not find profile for ${username}`);
  }

  res.status(200).json({ data: userProfile });
});

export const content = withErrorCatcher<UserContentParams>(async (req, res) => {
  const { username, contentType } = req.params;
  const { verifiedAccessToken } = req;

  if (!verifiedAccessToken) {
    throw new AuthError('Invalid access token');
  }

  if (contentType !== 'tokens' && contentType !== 'blogs') {
    throw new BadRequestError(
      `Invalid content type provided (${contentType}). The accepted values are: "tokens", "blogs".`
    );
  }

  const userContent = await prisma.user.findUnique({
    where: { username },
    select: { [contentType]: true }
  });

  if (!userContent) {
    throw new NotFoundError(`No ${contentType} found for ${username}`);
  }

  res.status(200).json({
    data: userContent[contentType]
  });
});

export const contentRecord = withErrorCatcher<UserContentRecordParams>(async (req, res) => {
  const { username, contentType, id } = req.params;
  const { verifiedAccessToken } = req;

  if (!verifiedAccessToken) {
    throw new AuthError('Invalid access token');
  }

  if (contentType !== 'tokens' && contentType !== 'blogs') {
    throw new BadRequestError(
      `Invalid content type provided (${contentType}). The accepted values are: "tokens", "blogs".`
    );
  }

  const userContent = await prisma.user.findUnique({
    where: { username, [contentType]: { some: { id } } },
    select: { [contentType]: true }
  });

  if (!userContent || !userContent[contentType] || userContent[contentType].length === 0) {
    throw new NotFoundError(`No ${contentType} found for ${username}`);
  }

  res.status(200).json({
    data: userContent[contentType][0]
  });
});

export const updateWalletHash = withErrorCatcher<
  UserParams,
  unknown,
  { walletHash?: string | null }
>(async (req, res) => {
  const { username } = req.params;
  const { verifiedAccessToken } = req;

  if (!verifiedAccessToken) {
    throw new AuthError('Invalid access token');
  }

  const userProfile = await prisma.user.update({
    where: { username },
    data: { walletHash: req.body.walletHash ?? null }
  });

  if (!userProfile) {
    throw new NotFoundError(`Could not find profile for ${username}`);
  }

  res.sendStatus(200);
});
