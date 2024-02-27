import { NftCollection } from '@prisma/client';
import AppError from '~/errors/app-error';
import AuthError from '~/errors/auth-error';
import NotFoundError from '~/errors/not-found-error';
import Dag from '~/lib/dag';
import { prisma } from '~/server';
import { withErrorCatcher } from '~/utils/app';
import { getImageUri, saveImage } from '~/utils/image';
import JWT from '~/utils/jwt';
import { generateRandomKey, slugify } from '~/utils/string';
import { logError } from '~/utils/log';

type BaseParams = {
  username: string;
};

type CreateTokensRequestBody = {
  tokens: Array<{
    name: string;
    description: string;
    image: string;
    collectionId: string;
  }>;
};

/**
 * Create new tokens for the authenticated user
 *
 * @throws {AuthError} if the access token is invalid
 * @throws {NotFoundError} if the collection id is invalid
 * @throws {AppError} if the tokens could not be minted
 * @returns {Array<NftToken>} the created tokens
 */
export const createTokens = withErrorCatcher<BaseParams, undefined, CreateTokensRequestBody>(
  async (req, res) => {
    const { verifiedAccessToken } = req;
    if (!verifiedAccessToken) throw new AuthError('Invalid access token');

    const { username } = JWT.decode(verifiedAccessToken);
    if (username !== req.params.username) throw new AuthError('Invalid access token');

    const { tokens } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) throw new AuthError('Invalid access token');

    // Add private key if user doesn't have one
    if (!user.privateKey) {
      const privateKey = generateRandomKey();
      await prisma.user.update({ where: { id: user.id }, data: { privateKey } });
      user.privateKey = privateKey;
    }

    const collectionsWithIsValidProp = await Promise.all(
      tokens.map(async (token) => {
        const collection = await prisma.nftCollection.findUnique({
          where: { id: token.collectionId }
        });
        return {
          id: token.collectionId,
          collection,
          isValid: !!collection
        };
      })
    );

    const invalidCollectionIds = collectionsWithIsValidProp
      .filter((collection) => !collection.isValid)
      .map((collection) => collection.id);

    if (invalidCollectionIds.length > 1) {
      throw new NotFoundError(`Invalid collection ids: ${invalidCollectionIds.join(', ')}`);
    }
    if (invalidCollectionIds.length > 0) {
      throw new NotFoundError(`Invalid collection id: ${invalidCollectionIds[0]}`);
    }

    const idToNftCollection = collectionsWithIsValidProp.reduce(
      (acc, { collection }) => {
        if (collection) {
          acc[collection.id] = collection;
        }
        return acc;
      },
      {} as Record<string, NftCollection>
    );

    const tokensToAdd = await Promise.all(
      tokens.map(async (token) => {
        const collection = idToNftCollection[token.collectionId];
        const collectionName = collection.name;
        const index = ++collection.tokensCount;
        const imagePath = slugify(
          `${user.username}/collections/${collectionName}/tokens/${token.name}_${index}`
        );
        const fullPath = await saveImage(token.image, imagePath);
        return {
          ...token,
          nftId: index,
          imageUri: fullPath,
          name: `${token.name}`
        };
      })
    );

    const dag = Dag.create(user.privateKey);

    // Add tokens to DB
    const createdTokenRecords = await prisma.$transaction(
      tokensToAdd.map((token) => {
        const ownerAddress = dag.account.address;
        const { name, nftId, description, imageUri, collectionId } = token;

        return prisma.nftToken.create({
          data: {
            name,
            nftId,
            description,
            imageUri,
            collectionId,
            ownerAddress,
            ownerId: user.id
          },
          select: {
            id: true,
            nftId: true,
            name: true,
            description: true,
            ownerId: true,
            imageUri: true,
            ownerAddress: true,
            collectionId: true
          }
        });
      })
    );

    // Prepare the signed actions from the DB records
    const signedActions = await Promise.all(
      createdTokenRecords.map((token) => {
        const { nftId, name, ownerAddress, description, imageUri, collectionId } = token;

        /****************************************************
         *    THE ORDER OF THESE KEYS MATTERS FOR DAG4      *
         *  CHANGING THEIR ORDER WILL BREAK THE SIGNATURE   *
         *         DO. NOT. CHANGE. THE. ORDER.             *
         ****************************************************/
        return dag.sign({
          MintNFT: {
            owner: ownerAddress,
            collectionId,
            nftId,
            uri: getImageUri(imageUri),
            name,
            description,
            metadata: {}
          }
        });
      })
    );

    try {
      await Promise.all(signedActions.map((signedAction) => signedAction.send()));
      res.status(201).json({ data: createdTokenRecords });

      // Update collections tokensCount in DB
      await prisma.$transaction(
        Object.values(idToNftCollection).map((collection) =>
          prisma.nftCollection.update({
            where: { id: collection.id },
            data: { tokensCount: collection.tokensCount }
          })
        )
      );
    } catch (e) {
      // rollback db changes if minting fails
      logError(e);
      await prisma.nftToken.deleteMany({
        where: { id: { in: createdTokenRecords.map((token) => token.id) } }
      });
      throw new AppError('Failed to mint tokens');
    }
  }
);

/**
 * Get all tokens for the authenticated user
 * @throws {AuthError} if the access token is invalid
 * @returns {Array<NftToken>} the tokens
 */
export const getTokens = withErrorCatcher<BaseParams>(async (req, res) => {
  const { username } = req.params;
  const verifiedAccessToken = req.verifiedAccessToken;
  if (!verifiedAccessToken) throw new AuthError('Invalid access token');

  const { username: tokenUsername } = JWT.decode(verifiedAccessToken);
  if (username !== tokenUsername) throw new AuthError('Invalid access token');

  const tokens = await prisma.nftToken.findMany({
    where: { owner: { username } },
    include: {
      owner: true,
      collection: true
    }
  });

  res.status(200).json({ data: tokens });
});

/**
 * Get the count of tokens for the authenticated user
 * @throws {AuthError} if the access token is invalid
 * @returns {number} the count of tokens
 */
export const getTokensCount = withErrorCatcher<BaseParams>(async (req, res) => {
  const { username } = req.params;
  const verifiedAccessToken = req.verifiedAccessToken;
  if (!verifiedAccessToken) throw new AuthError('Invalid access token');

  const { username: tokenUsername } = JWT.decode(verifiedAccessToken);
  if (username !== tokenUsername) throw new AuthError('Invalid access token');

  const tokensCount = await prisma.nftToken.count({
    where: { owner: { username } }
  });

  res.status(200).json({ data: tokensCount });
});
