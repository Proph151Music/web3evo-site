export default function NFTPage() {
  return (
    <div>
      <div className="nft-banner-image"></div>
      <div className="page-gutter">
        <h2 className="nft-page-title">The Orbitians</h2>
        <p className="gray">Minted on Sep 30, 2022</p>
        <div className="nft-page-created-by">
          <span className="font-space-mono text-gray-450">Created by</span>
          <div className="d-flex margin-sm">
            <img src="/assets/nft-page/Avatar.svg" alt="avatar-img" />
            <span>Dish Studio</span>
          </div>
        </div>
        <div className="nft-page-description">
          <span className="font-space-mono text-gray-450">Description</span>
          <p className="margin-sm">
            The Orbitians <br></br>
            is a collection of 10,000 unique NFTs on the Ethereum blockchain,
          </p>
          <p>
            There are all sorts of beings in the NFT Universe. The most advanced and friendly of the
            bunch are Orbitians.
          </p>
          <p>
            They live in a metal space machines, high up in the sky and only have one foot on Earth.{' '}
            <br></br>
            These Orbitians are a peaceful race, but they have been at war with a group of invaders
            for many generations. The invaders are called Upside-Downs, because of their inverted
            bodies that live on the ground, yet do not know any other way to be. Upside-Downs
            believe that they will be able to win this war if they could only get an eye into
            Orbitian territory, so they've taken to make human beings their target.
          </p>
        </div>
      </div>
    </div>
  );
}
