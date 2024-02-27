import ProfileContent from './ProfileContent';
import useUserProfile from '../../hooks/use-user-profile';
import { useLocation } from 'wouter';
import api, { NftCollection } from '../../utils/api';
import { useUser } from '../../context/UserContext';
import Button, { ButtonProps } from '../../components/ui/Button';
import ArtistBanner from './ArtistBanner';
import Accolades from '../../components/Accolades';
import LinksRow from '../../components/LinksRow';
import styles from './style.module.css';
import useWalletConnector from '../../hooks/use-wallet-connector';
import CreateTokenWorkflowDialog from '../../components/CreateTokenWorkflowDialog';
import useQueryCallback from '../../hooks/use-query-callback';
import { useCallback, useEffect, useState } from 'react';
import useTokensCountQuery from '../../hooks/use-tokens-count-query';

export default function ProfilePage() {
  const [location, setLocation] = useLocation();
  const { user, loadingUser } = useUser();
  const username = user?.username ?? '';

  const { userProfile, loading: loadingProfile } = useUserProfile({ username });
  const {
    hash: walletHash,
    connect: connectWallet,
    disconnect: disconnectWallet,
    isConnecting
  } = useWalletConnector({
    username
  });

  const {
    collections,
    fetchCollections,
    loading: loadingCollections
  } = useNftCollectionsQuery({ username });

  const { formattedTokensCount, isTokensCountQueryLoading, tokensCountQueryError } =
    useTokensCountQuery({
      username
    });

  /*************************************
   *            Render Logic           *
   *************************************/

  if (loadingUser || loadingProfile || loadingCollections) {
    return <>Loading...</>;
  }

  // missing username means user is not signed-in
  if (!user && location !== '/login') {
    setLocation('/login');
    return null;
  }

  if (!userProfile) {
    return <>User not found.</>;
  }

  const { blogs } = userProfile;

  const displayedName = userProfile.name || userProfile.username;
  const labelClass = 'font-space-mono text-[22px] font-bold text-gray-450';
  const summaryClass = `page-gutter mx-auto max-w-7xl ${styles.summary}`;

  const primaryButtonProps: ButtonProps = {
    label: walletHash ? 'Disconnect Wallet' : 'Connect Your Wallet',
    onClick: walletHash ? disconnectWallet : connectWallet
  };

  return (
    <div>
      <ArtistBanner />

      <div className={summaryClass}>
        <h2 className={styles.summary__name}>{displayedName}</h2>

        {isTokensCountQueryLoading && <p>Loading tokens count...</p>}
        {!isTokensCountQueryLoading && tokensCountQueryError && <p>Error loading tokens count</p>}
        {!isTokensCountQueryLoading && formattedTokensCount && (
          <Accolades
            className={`${styles.summary__accolades}`}
            items={[{ value: formattedTokensCount, label: 'Tokens Created' }]}
          />
        )}

        <div className={styles.summary__bio}>
          <p className={labelClass}>Bio</p>
          <p>The internet's friendliest designer kid.</p>
        </div>

        <div className={styles.summary__links}>
          <p className={labelClass}>Links</p>
          <LinksRow />
        </div>

        <div className={styles.summary__actions}>
          <Button {...primaryButtonProps} nowrap isLoading={isConnecting} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : primaryButtonProps.label}
          </Button>

          <CreateTokenWorkflowDialog
            disabled={!walletHash}
            defaultCollections={collections}
            onSubmit={fetchCollections}
          />
        </div>

        {walletHash && (
          <div className={styles.summary__walletHash}>
            <p className={labelClass}>Wallet Id</p>
            <p>{walletHash}</p>
          </div>
        )}
      </div>

      <ProfileContent blogs={blogs} collections={collections} />
    </div>
  );
}

export function useNftCollectionsQuery({ username }: { username: string }) {
  const [collections, setCollections] = useState<NftCollection[]>([]);

  const { query, loading, reset } = useQueryCallback(() => api.getNftCollections({ username }));

  const fetchCollections = useCallback(async () => {
    const response = await query();
    setCollections(response?.data ?? []);
  }, [query]);

  useEffect(() => {
    if (username) {
      fetchCollections();
    }
    return () => reset();
  }, [reset, username, fetchCollections]);

  return { collections, loading, fetchCollections };
}
