export default function ArtistBanner() {
  return (
    <div
      className="
        h-80
        mb-16
        relative
        bg-center
        bg-no-repeat
        bg-cover
        bg-[url('/public/assets/artist-page/artist-banner.svg')]
    "
    >
      <img
        width={120}
        height={120}
        className="absolute bottom-[-60px] left-[4.5rem]"
        src="/assets/artist-page/avatar-artist-page.svg"
        alt=""
      />
    </div>
  );
}
