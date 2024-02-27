import SubscribeWidget from '../components/SubscribeWidget';
import HowItWorksCard from '../components/HowItWorksCard';
import { Link } from 'wouter';
import Button from '../components/ui/Button';
import Accolades from '../components/Accolades';

const howItWorksCardsData = [
  {
    img: '/assets/home-screen/how-it-works-setup-wallet.svg',
    title: 'Setup Your Wallet',
    description:
      'Set up your wallet of choice. Connect it to the NFT market by clicking the wallet icon in the top right corner.'
  },
  {
    img: '/assets/home-screen/how-it-works-create-collection.svg',
    title: 'Create Collection',
    description:
      'Upload your work and setup your collection. Add a description, social links and floor price.'
  },
  {
    img: '/assets/home-screen/how-it-works-start-earning.svg',
    title: 'Start Earning',
    description:
      'Choose between auctions and fixed-price listings. Start earning by selling your NFTs or trading others.'
  }
];

export default function HomePage() {
  const howItWorksCards = howItWorksCardsData.map((data) => (
    <HowItWorksCard
      key={data.title}
      img={data.img}
      title={data.title}
      description={data.description}
    />
  ));

  return (
    <div className="page-gutter">
      <section className="hero-home-section">
        <h1 className="hero-home-section__title text-3xl sm:text-4xl md:text-5xl xl:text-7xl">
          Discover digital art & Collect NFTs
        </h1>

        <p className="hero-home-section__subtitle">
          NFT marketplace UI created with Anima for Figma. Collect, buy and sell art from more than
          20k NFT artists.
        </p>

        <Link to="/nft-page">
          <a href="/nft-page" className="hero-home-section__image min-w-full">
            <img
              src="assets/home-screen/Highlighted-NFT.svg"
              alt="highlighted-nft"
              width={'100%'}
            />
          </a>
        </Link>

        <div className="hero-home-section__get-started flex flex-col gap-4">
          <Button label="Get Started" iconPath="assets/icons/RocketLaunch.svg" />
          <Accolades
            items={[
              { value: '240k+', label: 'Total Sales' },
              { value: '100k+', label: 'Auctions' },
              { value: '240k+', label: 'Artists' }
            ]}
          />
        </div>
      </section>

      <section>
        <h2>Browse Categories</h2>
        <div className="home-category-cards-container">
          <img className="category-card" src="/assets/home-screen/category-card-art.png" alt="" />
          <img
            className="category-card"
            src="/assets/home-screen/category-card-collectibles.png"
            alt=""
          />
          <img className="category-card" src="/assets/home-screen/category-card-music.png" alt="" />
          <img
            className="category-card"
            src="/assets/home-screen/category-card-photography.png"
            alt=""
          />
          <img className="category-card" src="/assets/home-screen/category-card-sport.png" alt="" />
          <img
            className="category-card"
            src="/assets/home-screen/category-card-utility.png"
            alt=""
          />
          <img className="category-card" src="/assets/home-screen/category-card-video.png" alt="" />
          <img
            className="category-card"
            src="/assets/home-screen/category-card-virtual-worlds.png"
            alt=""
          />
        </div>
      </section>

      <section>
        <h2>How It Works</h2>
        <p>Find out how to get started</p>
        <div className="how-it-works-container">{howItWorksCards}</div>
      </section>

      <section className="d-flex subscribe-section">
        <img
          src="/assets/home-screen/astronaut.svg"
          alt="astronaut reading newspaper"
          width={'100%'}
        />
        <div className="flex flex-col gap-4">
          <h2>Join Our Weekly Digest</h2>
          <p>Get exclusive promotions & updates straight to your inbox.</p>
          <SubscribeWidget />
        </div>
      </section>
    </div>
  );
}
