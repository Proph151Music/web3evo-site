import { StargazerConnector } from '@stardust-collective/web3-react-stargazer-connector';

const stargazerConnector = new StargazerConnector({
  supportedChainIds: [
    1, // Ethereum Mainnet
    5, // Ethereum Goerli Testnet
    137, // Polygon Mainnet
    80001, // Polygon Testnet
    56, // BSC Mainnet
    97, // BSC Testnet
    43114, // Avalanche C-Chain
    43113 // Avalanche Fuji Testnet
  ]
});

export default stargazerConnector;
