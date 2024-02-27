import * as RadixDialog from '@radix-ui/react-dialog';
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from './Button';
import { Cross2Icon } from '@radix-ui/react-icons';

export const Dialog = RadixDialog.Root;

export const DialogTrigger = RadixDialog.Trigger;

export const DialogDescription = RadixDialog.Description;

export const DialogPortal = RadixDialog.Portal;

export const DialogTitle = forwardRef<
  ElementRef<typeof RadixDialog.Title>,
  ComponentPropsWithoutRef<typeof RadixDialog.Title>
>((props, ref) => {
  const { className = '', ...rest } = props;
  const classes = twMerge('text-4xl font-medium', className);
  return <RadixDialog.Title className={classes} {...rest} ref={ref} />;
});

export const DialogClose = forwardRef<
  ElementRef<typeof RadixDialog.Close>,
  ComponentPropsWithoutRef<typeof RadixDialog.Close>
>((props, ref) => {
  const { title = 'Close Dialog', ...rest } = props;
  return <RadixDialog.Close title={title} {...rest} ref={ref} />;
});

export const DialogOverlay = forwardRef<
  ElementRef<typeof RadixDialog.Overlay>,
  ComponentPropsWithoutRef<typeof RadixDialog.Overlay>
>((props, ref) => {
  const { className = '', ...rest } = props;
  const classes = twMerge('fixed inset-0 bg-[rgb(0,0,0,0.3)] animate-overlayShow', className);
  return <RadixDialog.Overlay className={classes} {...rest} ref={ref} />;
});

export const DialogContent = forwardRef<
  ElementRef<typeof RadixDialog.Content>,
  ComponentPropsWithoutRef<typeof RadixDialog.Content>
>((props, ref) => {
  const { className = '', ...rest } = props;
  const classes = twMerge(
    'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-800 animate-dialogContentShow',
    className
  );
  return <RadixDialog.Content className={classes} {...rest} ref={ref} />;
});

export const DialogCancel = forwardRef<
  ElementRef<typeof RadixDialog.Close>,
  ComponentPropsWithoutRef<typeof RadixDialog.Close>
>((props, ref) => {
  return (
    <DialogClose ref={ref} asChild {...props}>
      <Button variant="icon" className="w-[30px] h-[30px] absolute top-4 right-2">
        <Cross2Icon width={20} height={20} />
      </Button>
    </DialogClose>
  );
});
