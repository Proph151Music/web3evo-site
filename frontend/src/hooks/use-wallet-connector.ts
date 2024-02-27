import { useWeb3React } from '@web3-react/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import stargazerConnector from '../connectors/stargazer-connector';
import api from '../utils/api';

type useWalletConnectorProps = {
  username: string;
};

export default function useWalletConnector(props: useWalletConnectorProps) {
  const { username } = props;

  const web3ReactUpdateFiredRef = useRef(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { activate, deactivate, account: hash, active: isActive } = useWeb3React();

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      await activate(stargazerConnector);
      // Reload the page if the user dismisses the popup without connecting
      if (!hash && !web3ReactUpdateFiredRef.current) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error connecting to Stargazer wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [hash, activate]);

  // Note that `deactivate` does not actually disconnect the wallet, it only clears the state
  // Disconnecting the wallet from this client can only be done from the Stargazer wallet itself
  const disconnect = useCallback(async () => {
    deactivate();
    await api.updateWalletHash({ username, walletHash: null });
  }, [deactivate, username]);

  // This is only needed because `activate` does not return the account immediately
  // Ideally this logic should be in the connectWallet function, but it's not possible
  useEffect(() => {
    if (username && hash) {
      api.updateWalletHash({ username, walletHash: hash });
    }
  }, [username, hash]);

  useEffect(() => {
    const web3ReactUpdateHandler = (_e: unknown) => {
      web3ReactUpdateFiredRef.current = true;
    };

    stargazerConnector.on('Web3ReactUpdate', web3ReactUpdateHandler);
    return () => {
      stargazerConnector.off('Web3ReactUpdate', web3ReactUpdateHandler);
    };
  }, []);

  return {
    hash: hash,
    isConnecting,
    isActive,
    connect,
    disconnect
  };
}
