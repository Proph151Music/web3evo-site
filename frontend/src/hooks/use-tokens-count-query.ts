import { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import useQueryCallback from './use-query-callback';

export default function useTokensCountQuery({ username }: { username: string }) {
  const [tokensCount, setTokensCount] = useState<number | null>(null);
  const {
    query: getTokensCount,
    loading: isTokensCountQueryLoading,
    error: tokensCountQueryError
  } = useQueryCallback(async () => {
    return await api.getNftTokensCount({ username });
  });

  useEffect(() => {
    async function fetchTokensCount() {
      const response = await getTokensCount();
      if (response) {
        setTokensCount(response.data);
      }
    }
    if (username) {
      fetchTokensCount();
    }
  }, [getTokensCount, username]);

  const formattedTokensCount = useMemo(() => {
    if (tokensCount === null) return null;
    if (tokensCount < 1000) return String(tokensCount);
    if (tokensCount < 1000000) return `${(tokensCount / 1000).toFixed(1)}k`;
    return `${(tokensCount / 1000000).toFixed(1)}m`;
  }, [tokensCount]);

  return { tokensCount, formattedTokensCount, isTokensCountQueryLoading, tokensCountQueryError };
}
