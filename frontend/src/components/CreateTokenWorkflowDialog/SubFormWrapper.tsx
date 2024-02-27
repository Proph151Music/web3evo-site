import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import SubFormFooter, { SubFormFooterProps } from './SubFormFooter';
import Stepper, { StepData } from './Stepper';

type SubFormWrapperProps = {
  children: ReactNode;
  className?: string;
  steps: StepData[];
  step: number;
  onStepChange: (step: number) => void;
} & SubFormFooterProps;

export default function SubFormWrapper(props: SubFormWrapperProps) {
  const { children, className, steps, step, onStepChange, ...footerProps } = props;
  const classes = twMerge(
    'h-full flex flex-col',
    'overflow-auto',
    'border border-gray-600 rounded-xl mb-4',
    className
  );

  const onStepChangeHandler = (nextStep: number) => {
    if (nextStep < step) {
      footerProps.onBack?.();
    } else if (nextStep > step) {
      footerProps.onSubmit();
    }
    onStepChange(nextStep);
  };
  return (
    <>
      <Stepper className="my-10" steps={steps} value={step} onChange={onStepChangeHandler} />
      <div className={classes}>{children}</div>
      <SubFormFooter {...footerProps} />
    </>
  );
}
