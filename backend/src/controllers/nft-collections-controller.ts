import AuthError from '~/errors/auth-error';
import { withErrorCatcher } from '~/utils/app';
import { prisma } from '~/server';
import Dag from '~/lib/dag';
import JWT from '~/utils/jwt';
import NotFoundError from '~/errors/not-found-error';
import { getImageUri } from '~/utils/image';
import DagError from '~/errors/dag-error';
import { generateRandomKey, slugify } from '~/utils/string';

type BaseParams = {
  username: string;
};

type CollectionParams = BaseParams & {
  collectionName: string;
};

type CollectionDetailsParams = BaseParams & {
  collectionId: string;
};

type CollectionBody = {
  name: string;
  logoUrl?: string;
};

const COMMON_COLLECTIONS_FIELDS = {
  id: true,
  name: true,
  dateMinted: true,
  updatedAt: true,
  logoUrl: true,
  tokensCount: true
} as const;

const DEFAULT_COLLECTION_LOGO_URL = getImageUri('images/default-collection-logo.png');

/**
 * Retrieves all collections owned by the authenticated user.
 *
 * @returns The user's collections or an empty array if none are found.
 * @throws {AuthError} If the access token is invalid.
 */
export const getCollections = withErrorCatcher<BaseParams>(async (req, res) => {
  const { verifiedAccessToken } = req;
  if (!verifiedAccessToken) throw new AuthError('Invalid access token');

  const { username } = JWT.decode(verifiedAccessToken);
  if (username !== req.params.username) throw new AuthError('Invalid access token');

  const collections = await prisma.nftCollection.findMany({
    where: { owner: { username } },
    select: COMMON_COLLECTIONS_FIELDS
  });

  res.status(200).json({ data: collections });
});

/**
 * Creates one or more collections for the authenticated user.
 *
 * @returns The created collections.
 * @throws {AuthError} If the access token is invalid.
 * @throws {DagError} If the collections failed to mint.
 */
export const createCollections = withErrorCatcher<
  BaseParams,
  undefined,
  { collections: CollectionBody[] }
>(async (req, res) => {
  const { verifiedAccessToken } = req;
  if (!verifiedAccessToken) throw new AuthError('Invalid access token');

  const { collections } = req.body;

  const { userId, username } = JWT.decode(verifiedAccessToken);
  if (username !== req.params.username) throw new AuthError('Invalid access token');

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new AuthError('Invalid access token');

  // Add private key if user doesn't have one
  if (!user.privateKey) {
    const privateKey = generateRandomKey();
    await prisma.user.update({ where: { id: user.id }, data: { privateKey } });
    user.privateKey = privateKey;
  }
  console.log('using pkey:', user.privateKey);
  const dag = Dag.create(user.privateKey);

  const signedActions = await Promise.all(
    collections.map((collection) =>
      dag.sign({ MintCollection: { name: slugify(`${username}/${collection.name}`) } })
    )
  );

  // Mint the collections
  const mintingResponses = await Promise.all(
    signedActions.map((signedAction) => signedAction.send())
  );
  console.log(mintingResponses);
  await new Promise((r) => setTimeout(r, 30 * 1000));
  const collectionIds = mintingResponses.map(({ hash }) => hash);

  if (!collectionIds.length) {
    throw new DagError('Failed to mint collections');
  }

  const data = collections.map((collection, index) => ({
    id: collectionIds[index],
    logoUrl: collection.logoUrl?.trim() || DEFAULT_COLLECTION_LOGO_URL,
    name: collection.name.trim(),
    ownerId: user.id
  }));

  const createdCollections = await prisma.$transaction(
    data.map((collection) =>
      prisma.nftCollection.create({ data: collection, select: COMMON_COLLECTIONS_FIELDS })
    )
  );

  res.status(201).json({ data: createdCollections });
});

/**
 * Retrieves a collection (by name) owned by the authenticated user.
 *
 * @returns The collection data if found.
 * @throws {AuthError} If the access token is invalid.
 * @throws {NotFoundError} If the collection or access token is not found.
 */
export const getCollection = withErrorCatcher<CollectionParams>(async (req, res) => {
  const { verifiedAccessToken } = req;
  if (!verifiedAccessToken) throw new AuthError('Invalid access token');

  const { username } = JWT.decode(verifiedAccessToken);
  if (username !== req.params.username) {
    throw new AuthError('Invalid access token');
  }

  const collection = await prisma.nftCollection.findUnique({
    where: {
      owner: { username },
      name: req.params.collectionName.trim()
    }
  });

  if (!collection) {
    throw new NotFoundError('Collection not found');
  }

  res.status(200).send({ data: collection });
});

/**
 * Retrieves all tokens within a collection owned by the authenticated user.
 *
 * @returns The collection data if found.
 * @throws {AuthError} If the access token is invalid.
 * @throws {NotFoundError} If the collection or access token is not found.
 */
export const getCollectionDetails = withErrorCatcher<CollectionDetailsParams>(async (req, res) => {
  const { verifiedAccessToken } = req;
  if (!verifiedAccessToken) throw new AuthError('Invalid access token');

  const { username } = JWT.decode(verifiedAccessToken);
  if (username !== req.params.username) {
    throw new AuthError('Invalid access token');
  }

  const collection = await prisma.nftCollection.findUnique({
    where: { id: req.params.collectionId },
    include: {
      nftTokens: true,
      owner: { select: { username: true } }
    }
  });

  if (!collection) {
    throw new NotFoundError('Collection not found');
  }

  collection.nftTokens = collection.nftTokens.map((token) => ({
    ...token,
    imageUri: getImageUri(token.imageUri)
  }));

  res.status(200).json({ data: collection });
});
