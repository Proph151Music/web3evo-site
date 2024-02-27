import { ForwardedRef, HTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { forwardRef } from 'react';

type BaseCardProps = {
  children?: ReactNode;
  className?: string;
};

export type CardProps = BaseCardProps & HTMLAttributes<HTMLDivElement>;

export type CardMediaProps = CardProps & {
  src: string;
};

export type CardInfoRowProps = CardProps & {
  label: string;
};

const Card = forwardRef((props: CardProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { children, className, ...divProps } = props;
  return (
    <div
      ref={ref}
      className={twMerge(
        'flex flex-col rounded-lg overflow-hidden',
        'shadow-lg active:opacity-80',
        className
      )}
      {...divProps}
    >
      {children}
    </div>
  );
});

export const CardMedia = forwardRef((props: CardMediaProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { src, className } = props;
  return (
    <div
      ref={ref}
      style={{ backgroundImage: `url('${src}')` }}
      className={twMerge(`h-[250px] bg-no-repeat bg-center bg-cover`, className)}
    />
  );
});

export const CardTitle = forwardRef(
  (props: BaseCardProps, ref: ForwardedRef<HTMLHeadingElement>) => {
    const { children, className } = props;
    return (
      <h2
        ref={ref}
        className={twMerge(
          'text-xl font-medium text-white whitespace-nowrap overflow-hidden w-full text-ellipsis',
          className
        )}
      >
        {children}
      </h2>
    );
  }
);

export const CardSubtitle = forwardRef(
  (props: BaseCardProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { children, className } = props;
    return (
      <p
        ref={ref}
        className={twMerge(
          'text-base font-mono text-white whitespace-nowrap overflow-hidden w-full text-ellipsis',
          className
        )}
      >
        {children}
      </p>
    );
  }
);

export const CardContent = forwardRef((props: BaseCardProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { children, className } = props;
  return (
    <div ref={ref} className={twMerge('bg-neutral-800 flex-1 p-2', className)}>
      {children}
    </div>
  );
});

export const CardInfoRow = forwardRef(
  (props: CardInfoRowProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { label, children, className } = props;
    return (
      <div ref={ref} className={twMerge('flex items-baseline justify-between w-full', className)}>
        <span className="text-sm font-mono text-gray-500">{label}</span>
        <span className="text-sm font-mono text-gray-300">{children}</span>
      </div>
    );
  }
);

export default Card;
