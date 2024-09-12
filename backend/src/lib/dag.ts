import crypto from 'crypto';
import axios, { AxiosError } from 'axios';
import { dag4 } from '@stardust-collective/dag4';
import DagError from '~/errors/dag-error';

export type MintCollectionAction = {
  MintCollection: { name: string };
};

export type MintCollectionNftAction = {
  MintNFT: {
    owner: string;
    collectionId: string;
    nftId: number;
    uri: string;
    name: string;
    description: string;
    metadata: Record<string, string>;
  };
};

export type TransferCollectionAction = {
  TransferCollection: {
    fromAddress: string;
    toAddress: string;
    collectionId: string;
  };
};

export type TransferCollectionNftAction = {
  TransferNFT: {
    fromAddress: string;
    toAddress: string;
    collectionId: string;
    nftId: number;
  };
};

export type MetagraphNftCollectionAction =
  | MintCollectionAction
  | MintCollectionNftAction
  | TransferCollectionAction
  | TransferCollectionNftAction;

export type StargazerDagSignatureRequest = {
  content: string;
  metadata: Record<string, null | string | number | boolean>;
};

export type DagAccount = ReturnType<typeof dag4.createAccount>;

const isAxiosError = (value: any): value is AxiosError => {
  return value?.isAxiosError === true;
};

/**
 * Represents a DAG (Directed Acyclic Graph) class used for
 * creating and signing actions related to a metagraph NFT collection.
 */
export default class Dag {
  static create(accountPk: string) {
    let account = dag4.createAccount(accountPk);
    let signActionMessage = Dag.sign;

    if (!account.keyTrio) {
      throw new DagError('Could not create DAG account');
    }

    return {
      account,
      sign: (actionMessage: MetagraphNftCollectionAction) =>
        signActionMessage({ actionMessage, account })
    };
  }

  private static async sign(props: {
    actionMessage: MetagraphNftCollectionAction;
    account: DagAccount;
  }) {
    const { actionMessage, account } = props;
    const { publicKey } = account.keyTrio;

    const encodedMessage = Buffer.from(JSON.stringify(actionMessage)).toString('base64');
    const signature = await dag4.keyStore.dataSign(account.keyTrio.privateKey, encodedMessage);

    const uncompressedPublicKey = publicKey.length === 128 ? '04' + publicKey : publicKey;

    return {
      signature,
      publicKey: uncompressedPublicKey,
      send: () => Dag.send({ publicKey: uncompressedPublicKey, signature, value: actionMessage })
    };
  }

  private static async send<T = unknown>(props: {
    publicKey: string;
    signature: string;
    value: T;
  }) {
    const { publicKey, signature, value } = props;

    const proof = {
      id: publicKey.substring(2),
      signature
    };

    const body = { value, proofs: [proof] };
    const euclidHost = process.env.EUCLID_HOST || 'http://host.docker.internal';
    const metagraphL1DataPort = process.env.METAGRAPH_L1_DATA_PORT;

    if (!euclidHost || !metagraphL1DataPort) {
      throw new Error('METAGRAPH_L1_DATA_URL not set');
    }

    const metagraphL1DataUrl = `${euclidHost}:${metagraphL1DataPort}`;
    let response;
    try {
      console.log('Sending Action Message:');
      console.log(JSON.stringify(body, null, 2));
      response = await axios.post(
        `${metagraphL1DataUrl}/data`,
        body
      );
      console.log('Response:');
      console.log(JSON.stringify(response.data, null, 2));
      return response.data;
      //return (await axios.post<{ hash: string }>(`${metagraphL1DataUrl}/data`, body)).data;
    } catch (e) {
      if (isAxiosError(e)) {
        console.log(`Status: ${e.status}`);
        console.log(JSON.stringify(e.response?.data, null, 2));
        throw new Error('Send Action Message Error: See above for details');
      }
      throw e;
    }
  }
}
