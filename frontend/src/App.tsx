import './App.css';
import { Redirect, Route, Router, Switch } from 'wouter';
import makeCachedMatcher from 'wouter/matcher';
import { Key, pathToRegexp } from 'path-to-regexp';
import HomePage from './pages/HomePage';
import CreateAccountPage from './pages/CreateAccountPage';
import NFTPage from './pages/NFTPage';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/Layout/AppLayout';
import UserContextProvider from './context/UserContext';
import ProfilePage from './pages/ArtistPage';
import { Web3ReactProvider } from '@web3-react/core';
import { ExternalProvider, Web3Provider, JsonRpcFetchFunc } from '@ethersproject/providers';
import CollectionDetailsPage from './pages/CollectionDetailsPage';
import BlogDetailsPage from './pages/BlogDetailsPage';

function getLibrary(provider: ExternalProvider | JsonRpcFetchFunc) {
  return new Web3Provider(provider);
}

const convertPathToRegexp = (path: string) => {
  let keys: Key[] = [];

  const regexp = pathToRegexp(path, keys, { strict: true });
  return { keys, regexp };
};

const customMatcher = makeCachedMatcher(convertPathToRegexp);
function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <UserContextProvider>
        <AppLayout>
          <Router matcher={customMatcher}>
            <Switch>
              <Route path="/">
                <HomePage />
              </Route>
              <Route path="/create-account">
                <CreateAccountPage />
              </Route>
              <Route path="/login">
                <LoginPage />
              </Route>
              <Route path="/artist-page">
                <Redirect to="/artist-page/collections" />
              </Route>
              <Route path="/artist-page/:contentType">
                <ProfilePage />
              </Route>
              <Route path="/artist-page/collections/:collectionId">
                <CollectionDetailsPage />
              </Route>
              <Route path="/artist-page/blogs/:blogId">
                <BlogDetailsPage />
              </Route>
              <Route path="/nft-page">
                <NFTPage />
              </Route>
            </Switch>
          </Router>
        </AppLayout>
      </UserContextProvider>
    </Web3ReactProvider>
  );
}

export default App;
