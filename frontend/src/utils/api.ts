/************************************************************
 *                                                          *
 * This file contains all the type definitions of the API   *
 *  responses as well as a utility class grouping methods   *
 *   that act as type-safe wrappers for the API requests.   *
 *                                                          *
 ***********************************************************/

import { AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import Axios, { isAxiosError } from '../lib/axios';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**********************************************
 *                ZOD SCHEMAS                 *
 **********************************************/
export const RoleSchema = z.enum(['ADMIN', 'USER']);

export const UserSchema = z.object({
  id: z.string().uuid(),
  walletHash: z.string().optional(),
  name: z.string().optional(),
  username: z.string(),
  email: z.string(),
  role: RoleSchema.default('USER'),
  password: z.string(),
  isVerified: z.boolean()
});

export const BlogSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  blogTitle: z.string(),
  dateCreated: z.date(),
  blogDescription: z.string().optional(),
  blogBanner: z.string().optional()
});

export const TokenSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  dateMinted: z.date(),
  title: z.string(),
  tokenDescription: z.string().optional(),
  tokenImage: z.string().optional()
});

export const AuthDataSchema = z.object({
  accessToken: z.string(),
  user: UserSchema
});

export const AuthResponseSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    user: UserSchema
  })
});

export const UserContentResponseSchema = z.object({
  data: z.array(z.union([TokenSchema, BlogSchema]))
});

export const ApiErrorSchema = z.object({
  name: z.string(),
  message: z.string(),
  statusCode: z.number()
});

export const ApiErrorResponseSchema = z.object({
  statusCode: z.number(),
  error: ApiErrorSchema
});

export const RegistrationBodySchema = z
  .object({
    username: z.string().min(6).max(256),
    email: z.string().email(),
    password: z
      .string()
      .regex(
        PASSWORD_REGEX,
        'Password must be at least 8 characters long and include a number, uppercase letter, lowercase letter, and a symbol.'
      ),
    passwordConfirmation: z.string().regex(PASSWORD_REGEX)
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ['passwordConfirmation'] // Path of the error
  });

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const UpdateWalletHashBodySchema = z.object({
  walletHash: z.string().nullable()
});

export const NftTokenResponseSchema = z.object({
  id: z.string(),
  imageUri: z.string(),
  name: z.string(),
  description: z.string().optional(),
  owner: UserSchema,
  dateMinted: z.date(),
  updatedAt: z.date()
});

export const NftCollectionInputSchema = z.object({
  name: z.string(),
  logoUrl: z.string().optional()
});

export const NftCollectionRequestBodySchema = z.object({
  collections: z.array(
    z.object({
      name: z.string(),
      logoUrl: z.string().optional()
    })
  )
});

export const NftCollectionResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  logoUrl: z.string(),
  tokensCount: z.number(),
  dateMinted: z.date(),
  updatedAt: z.date()
});

export const NftCollectionDetailsResponseSchema = NftCollectionResponseSchema.extend({
  nftTokens: z.array(NftTokenResponseSchema)
});

export const NftTokensRequestBodySchema = z.object({
  tokens: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      image: z.string(),
      collectionId: z.string()
    })
  )
});

/**********************************************
 *              INFERRED TYPES                *
 **********************************************/
type Response<T> = { data: T };
export type User = z.infer<typeof UserSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type Blog = z.infer<typeof BlogSchema>;
export type Token = z.infer<typeof TokenSchema>;
export type AuthData = z.infer<typeof AuthDataSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
export type RegistrationBody = z.infer<typeof RegistrationBodySchema>;
export type LoginBody = z.infer<typeof LoginBodySchema>;
export type UpdateWalletHashBody = z.infer<typeof UpdateWalletHashBodySchema>;
export type NftTokenResponse = z.infer<typeof NftTokenResponseSchema>;
export type NftCollectionRequestBody = z.infer<typeof NftCollectionRequestBodySchema>;
export type NftCollectionResponse = z.infer<typeof NftCollectionResponseSchema>;
export type NftToken = NftTokenResponse;
export type NftCollection = NftCollectionResponse;
export type NftCollectionInput = z.infer<typeof NftCollectionInputSchema>;
export type NftTokensRequestBody = z.infer<typeof NftTokensRequestBodySchema>;
export type NftCollectionDetailsResponse = z.infer<typeof NftCollectionDetailsResponseSchema>;

export type UserProfile = User & {
  blogs: Blog[];
  tokens: Token[];
};

export type ContentRequestParams = {
  username: string;
  contentType: 'tokens' | 'blogs';
};

export type ContentRecordRequestParams = ContentRequestParams & {
  contentId: string;
};

export type UpdateWalletHashRequestParams = UpdateWalletHashBody & { username: string };

/**********************************************
 *            API METHODS WRAPPER             *
 **********************************************/

class API {
  API_DOMAIN = `${process.env.REACT_APP_DOCKER_API || ''}/api/v1`;

  async register(credentials: RegistrationBody) {
    return await this.post<Response<AuthData>>('/register', {
      ...credentials,
      uri: `${window.location.hostname}/verify-email`
    });
  }

  async login({ email, password }: LoginBody) {
    return await this.post<Response<AuthData>>('/login', { email, password });
  }

  async getUserProfile({ username }: { username: string }) {
    return await this.get<Response<UserProfile>>(`/${username}`, { headers: this.getAuthHeader() });
  }

  async getCurrentUser() {
    return await this.get<Response<User>>('/current-user', { headers: this.getAuthHeader() });
  }

  async refreshAccessToken() {
    return await this.post<Response<AuthData>>('/refresh-access-token', {
      accessToken: window.localStorage.getItem('accessToken')?.trim()
    });
  }

  async logout() {
    return await this.post<void, null>('/logout', null, { headers: this.getAuthHeader() });
  }

  async content({ username, contentType }: ContentRequestParams) {
    return await this.get<Response<Array<Token | Blog>>>(`/${username}/content/${contentType}`, {
      headers: this.getAuthHeader()
    });
  }

  async contentRecord({ username, contentType, contentId }: ContentRecordRequestParams) {
    return await this.get<Response<Token | Blog>>(
      `/${username}/content/${contentType}/${contentId}`,
      {
        headers: this.getAuthHeader()
      }
    );
  }

  async updateWalletHash({ username, walletHash }: UpdateWalletHashRequestParams) {
    return await this.post<Response<User>>(
      `/${username}/wallet-hash`,
      { walletHash },
      { headers: this.getAuthHeader() }
    );
  }

  async createNftCollections({
    username,
    ...body
  }: { username: string } & NftCollectionRequestBody) {
    return await this.post<Response<NftCollectionResponse[]>>(
      `/${username}/nft-collections`,
      body,
      {
        headers: this.getAuthHeader()
      }
    );
  }

  async createNftTokens({ username, ...body }: { username: string } & NftTokensRequestBody) {
    return await this.post<Response<NftCollectionResponse[]>>(`/${username}/nft-tokens`, body, {
      headers: this.getAuthHeader()
    });
  }

  async getNftCollections({ username }: { username: string }) {
    return await this.get<Response<NftCollectionResponse[]>>(`/${username}/nft-collections`, {
      headers: this.getAuthHeader()
    });
  }

  async getNftTokensCount({ username }: { username: string }) {
    return await this.get<Response<number>>(`/${username}/nft-tokens-count`, {
      headers: this.getAuthHeader()
    });
  }

  async getNftCollection({ username, name }: { username: string; name: string }) {
    try {
      await this.get<Response<void>>(`/${username}/nft-collections/${name}`, {
        headers: this.getAuthHeader()
      });
      return true;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async getNftCollectionDetails({
    username,
    collectionId
  }: {
    username: string;
    collectionId: string;
  }) {
    try {
      return await this.get<Response<NftCollectionDetailsResponse>>(
        `/${username}/nft-collections/${collectionId}/details`,
        {
          headers: this.getAuthHeader()
        }
      );
    } catch (error) {
      throw error;
    }
  }

  private getAuthHeader() {
    return {
      Authorization: `Bearer ${window.localStorage.getItem('accessToken')?.trim() ?? ''}`
    };
  }

  private async post<R, T extends object | null = object>(
    path: string,
    body: T,
    options: AxiosRequestConfig = {}
  ) {
    return (
      await Axios.post<R>(`${this.API_DOMAIN}${path}`, body, {
        withCredentials: true,
        ...options
      })
    ).data;
  }

  private async get<R>(path: string, options: AxiosRequestConfig = {}) {
    return (
      await Axios.get<R>(`${this.API_DOMAIN}${path}`, {
        withCredentials: true,
        ...options
      })
    ).data;
  }
}

// Export API singleton
const api = new API();
export default api;
