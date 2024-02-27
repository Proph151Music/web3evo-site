import IconLink from './ui/IconLink';

// const GLOBE = '/assets/icons/Globe.svg';
const DISCORD = '/assets/icons/DiscordLogo.svg';
const YOUTUBE = '/assets/icons/YoutubeLogo.svg';
const TWITTER = '/assets/icons/TwitterLogo.svg';
const INSTAGRAM = '/assets/icons/InstagramLogo.svg';

const LINKS_DATA = [
  // { iconPath: GLOBE, title: 'Website', href: '/' },
  { iconPath: DISCORD, title: 'Discord', href: 'https://discord.com/' },
  { iconPath: YOUTUBE, title: 'Youtube', href: 'https://www.youtube.com/' },
  { iconPath: TWITTER, title: 'Twitter', href: 'https://twitter.com/' },
  { iconPath: INSTAGRAM, title: 'Instagram', href: 'https://www.instagram.com/' }
] as const;

export default function LinksRow() {
  return (
    <div className="flex gap-3">
      {LINKS_DATA.map((props) => (
        <IconLink key={props.title} {...props} />
      ))}
    </div>
  );
}
