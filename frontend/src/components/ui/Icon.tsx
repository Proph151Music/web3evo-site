import { twMerge } from 'tailwind-merge';
import { formatDimension } from '../../utils/format';

type IconProps = {
  width: number | string;
  height: number | string;
  path: string;
  className?: string;
};

const Icon = (props: IconProps) => {
  const { width, height, path, className = '' } = props;
  const mergedClassName = twMerge('inline-block', className, 'bg-contain bg-no-repeat bg-center');
  return (
    <span
      className={mergedClassName}
      style={{
        width: formatDimension(width),
        height: formatDimension(height),
        backgroundImage: `url('${path}')`
      }}
    />
  );
};

export default Icon;
