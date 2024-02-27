import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';

const Checkbox = forwardRef<HTMLButtonElement, CheckboxPrimitive.CheckboxProps>((props, ref) => {
  const { className = '', ...checkboxProps } = props;
  const classes = twMerge(
    'w-6 h-6 rounded-full flex items-center justify-center bg-white text-purple',
    className
  );
  return (
    <CheckboxPrimitive.Root ref={ref} className={classes} {...checkboxProps} asChild>
      <CheckboxPrimitive.Indicator>
        <CheckIcon width={20} height={20} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

export default Checkbox;
