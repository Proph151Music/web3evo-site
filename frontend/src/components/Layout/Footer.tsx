import { Link } from 'wouter';
import LinksRow from '../LinksRow';
import SubscribeWidget from '../SubscribeWidget';

export default function Footer() {
  return (
    <footer className="page-gutter bg-gray-600">
      <div className="max-w-[1400px] m-auto">
        <div className="flex justify-between">
          <section className="w-[330px]">
            <img width={243} src="/assets/navbar/header-logo.svg" alt="NFT Marketplace Logo" />
            <p>NFT Marketplace MVP</p>
            <p>Join our community</p>
            <LinksRow />
          </section>

          <section className="w-[240px]">
            <h5 className="font-space-mono">Explore</h5>
            <Link to="/">Marketplace</Link>
            <Link to="/blog">Blog</Link>
          </section>

          <section className="flex-1">
            <h5 className="font-space-mono">Join Our Weekly Digest</h5>
            <p>Get exclusive promotions & updates straight to your inbox.</p>

            <SubscribeWidget />
          </section>
        </div>

        <hr className="hr-spaced" />
        <small className="text-gray-450">Ⓒ NFT Marketplace MVP</small>
      </div>
    </footer>
  );
}
