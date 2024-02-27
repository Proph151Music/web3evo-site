import moment from 'moment';
import { NftCollection } from '../../utils/api';
import { Link } from 'wouter';
import Card, { CardContent, CardInfoRow, CardMedia, CardTitle } from '../../components/ui/Card';

type NftCollectionCardProps = {
  collection: NftCollection;
};

export default function NftCollectionsGrid({ collections }: { collections: NftCollection[] }) {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {collections.map((collection) => {
        return (
          <Link
            href={`/artist-page/collections/${collection.id}`}
            key={collection.id ?? collection.name}
          >
            <a href="_">
              <NftCollectionCard collection={collection} />
            </a>
          </Link>
        );
      })}
    </div>
  );
}

export function NftCollectionCard({ collection }: NftCollectionCardProps) {
  return (
    <Card className="cursor-pointer min-w-[225px] h-[350px]">
      <CardMedia src={collection.logoUrl} />
      <CardContent className="flex flex-col justify-between">
        <CardTitle>{collection.name}</CardTitle>

        <div className="flex flex-col items-baseline justify-between">
          <CardInfoRow label="Tokens">
            {new Intl.NumberFormat('en-US').format(collection.tokensCount)}
          </CardInfoRow>

          <CardInfoRow label="Date minted">
            {moment(collection.dateMinted).format('MMM DD, YYYY')}
          </CardInfoRow>
        </div>
      </CardContent>
    </Card>
  );
}
