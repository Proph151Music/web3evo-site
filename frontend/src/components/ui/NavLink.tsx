import { Link, LinkProps } from 'wouter';
import { twMerge } from 'tailwind-merge';

export default function NavLink(props: LinkProps) {
  let { className, ...linkProps } = props;

  className = twMerge('font-semibold', className);

  return <Link className={className} {...linkProps} />;
}
