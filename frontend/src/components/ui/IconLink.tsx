import { Link } from 'wouter';
import Icon from './Icon';

export type IconLinkProps = {
  iconPath: string;
  title: string;
  href: string;
};

const IconLink = (props: IconLinkProps) => {
  const isExternal = /^\s*https?:\/\//.test(props.href);

  if (isExternal) {
    return (
      <a href={props.href} title={props.title} target="_blank" rel="noreferrer">
        <Icon width={32} height={32} path={props.iconPath} />
      </a>
    );
  }

  return (
    <Link to={props.href} title={props.title} target="_blank" rel="noreferrer">
      <a href={props.href}>
        <Icon width={32} height={32} path={props.iconPath} className="cursor-pointer" />
      </a>
    </Link>
  );
};

export default IconLink;
