import { useParams } from 'wouter';
import useQueryCallback from '../hooks/use-query-callback';
import api, { NftCollectionDetailsResponse } from '../utils/api';
import { useUser } from '../context/UserContext';
import { useEffect, useState } from 'react';
import Card, {
  CardContent,
  CardInfoRow,
  CardMedia,
  CardSubtitle,
  CardTitle
} from '../components/ui/Card';
import moment from 'moment';
import { CircleBackslashIcon } from '@radix-ui/react-icons';

export default function CollectionDetailsPage() {
  const { collection } = useCollectionDetails();
  return (
    <div>
      <h1>NFT Collection Details</h1>
      <h2 className="font-light mb-16">{collection?.name}</h2>

      {collection?.nftTokens.length === 0 && (
        <div className="flex flex-col gap-3 items-center">
          <CircleBackslashIcon className="text-purple" width={150} height={150} />
          <h3 className="text-2xl font-light text-center text-gray-400">
            No NFTs in this collection yet
          </h3>
        </div>
      )}

      <div className="w-full grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
        {collection?.nftTokens.map((token) => {
          return (
            <Card
              key={token.id}
              className="h-[345px] border-2 border-purple shadow-lg shadow-purple-faded"
            >
              <CardMedia src={token.imageUri} className="bg-contain" />
              <CardContent className="bg-neutral-700 flex flex-col justify-between ">
                <CardTitle>{token.name}</CardTitle>

                <div className="flex-1">
                  <CardSubtitle>{token.description}</CardSubtitle>
                </div>

                <CardInfoRow label="Date minted">
                  {moment(token.dateMinted).format('MMM DD, YYYY')}
                </CardInfoRow>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function useCollectionDetails() {
  const { collectionId = '' } = useParams();
  const { user, loadingUser } = useUser();
  const username = user?.username;
  const [collection, setCollection] = useState<NftCollectionDetailsResponse | undefined>();

  if (!collectionId) {
    throw new Error('collectionId is required when calling useCollectionDetails');
  }

  const {
    reset,
    query,
    error,
    loading: loadingFetch
  } = useQueryCallback(({ username }: { username: string }) => {
    return api.getNftCollectionDetails({ username, collectionId });
  });

  useEffect(() => {
    async function fetchCollection() {
      if (username) {
        const response = await query({ username });
        if (response?.data) {
          setCollection(response.data);
        }
      }
    }
    fetchCollection();

    return reset;
  }, [query, username, reset]);

  return { collection, error, loading: loadingFetch || loadingUser };
}
