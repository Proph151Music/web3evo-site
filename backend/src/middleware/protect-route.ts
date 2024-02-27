import AuthError from '~/errors/auth-error';
import JWT from '~/utils/jwt';
import { withErrorCatcher } from '~/utils/app';

/**
 * Verifies that the user is authenticated.
 *
 * Forwards the request to the next middleware, if the bearer token is valid.
 * Throws an AuthError otherewise and rejects the request.
 */
const protectRoute = withErrorCatcher(async (req, _res, next) => {
  const { authorization } = req.headers;
  const { refreshToken } = req.cookies;

  if (!authorization || !refreshToken) {
    throw new AuthError('Invalid access token');
  }

  // Verify the token is not expired or tampered with
  const token = JWT.fromBearerToken(authorization);
  JWT.verify(token);

  // Token is valid. Proceed to the route.
  req.verifiedAccessToken = token;

  next();
});

export default protectRoute;
