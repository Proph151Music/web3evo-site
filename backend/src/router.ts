import express from 'express';
import protectRoute from '~/middleware/protect-route';
import * as UserController from '~/controllers/user-controller';
import * as AuthController from '~/controllers/auth-controller';
import * as NftCollectionsController from '~/controllers/nft-collections-controller';
import * as NftTokensController from '~/controllers/nft-tokens-controller';

const appRouter = express.Router({ mergeParams: true });
const userRouter = express.Router({ mergeParams: true });
const authRouter = express.Router({ mergeParams: true });
const collectionsRouter = express.Router({ mergeParams: true });
const tokensRouter = express.Router({ mergeParams: true });

/***********************************
 *           AUTH ROUTER           *
 ***********************************/
appRouter.use('/', authRouter);

authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.post('/forgot-password', AuthController.forgotPassword);
authRouter.post('/reset-password', AuthController.resetPassword);
authRouter.post('/refresh-access-token', AuthController.refreshAccessToken);

authRouter.use(protectRoute);
authRouter.get('/current-user', AuthController.currentUser);
authRouter.post('/logout', AuthController.logout);
authRouter.post('/request-verification', AuthController.requestVerificationToken);
authRouter.post('/verify-email', AuthController.verifyEmail);

/***********************************
 *           USER ROUTER           *
 ***********************************/
appRouter.use('/:username', userRouter);

userRouter.use(protectRoute);
userRouter.get('/', UserController.profile);
userRouter.get('/content/:contentType', UserController.content);
userRouter.get('/content/:contentType/:id', UserController.contentRecord);
userRouter.post('/wallet-hash', UserController.updateWalletHash);

/***********************************
 *     NFT COLLECTIONS ROUTER      *
 ***********************************/
userRouter.use('/', collectionsRouter);

collectionsRouter.get('/nft-collections', NftCollectionsController.getCollections);
collectionsRouter.post('/nft-collections', NftCollectionsController.createCollections);
collectionsRouter.get('/nft-collections/:collectionName', NftCollectionsController.getCollection);
collectionsRouter.get(
  '/nft-collections/:collectionId/details',
  NftCollectionsController.getCollectionDetails
);

/***********************************
 *          TOKENS ROUTER          *
 ***********************************/
userRouter.use('/', tokensRouter);

tokensRouter.get('/nft-tokens', NftTokensController.getTokens);
tokensRouter.post('/nft-tokens', NftTokensController.createTokens);
tokensRouter.get('/nft-tokens-count', NftTokensController.getTokensCount);

export default appRouter;
