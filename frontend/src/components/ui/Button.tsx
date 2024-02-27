import { ButtonHTMLAttributes, ForwardedRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import Icon from './Icon';

export type ButtonVariants = 'primary' | 'secondary' | 'text' | 'icon';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
  iconPath?: string;
  variant?: ButtonVariants;
  nowrap?: boolean;
  isLoading?: boolean;
};

const Button = forwardRef((props: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
  const {
    label,
    iconPath,
    children,
    className = '',
    variant = 'primary',
    nowrap,
    isLoading,
    ...buttonProps
  } = props;

  const nowrapClass = `${nowrap ? 'min-w-max' : ''}`;
  const displayedIconPath = isLoading ? '/assets/icons/LoadingSpinner.svg' : iconPath;

  return (
    <button
      ref={ref}
      type="button"
      className={twMerge(`
        font-semibold rounded-[20px] py-4 px-6
        flex items-center justify-center gap-3
        disabled:pointer-events-none disabled:opacity-50
        ${nowrapClass}
        ${getVaryingClasses(variant)}
        ${className}
      `)}
      {...buttonProps}
    >
      {displayedIconPath && (
        <Icon
          width={20}
          height={20}
          path={displayedIconPath}
          className={isLoading ? 'animate-spin' : ''}
        />
      )}
      {children ?? (label && <span>{label}</span>)}
    </button>
  );
});

export default Button;

/****************************
 *    UTILITY FUNCTIONS     *
 ****************************/
function getVaryingClasses(variant: ButtonVariants) {
  return (
    {
      primary: 'bg-purple text-white border-none active:bg-opacity-75',
      secondary: 'bg-gray-700 text-white border-2 border-purple active:opacity-75',
      text: 'bg-transparent text-purple border-none',
      icon: 'bg-transparent text-purple border-none rounded-full p-1 hover:bg-purple hover:bg-opacity-[0.15] active:bg-opacity-25'
    } as const
  )[variant];
}
