import { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export type StepData = {
  title: string;
  subtitle: string;
  isComplete: boolean;
};

type StepperProps = {
  steps: StepData[];
  value: number;
  className?: string;
  onChange: (value: number) => void;
};

type StepProps = StepData &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    isActive: boolean;
    isComplete: boolean;
    isHighlighted: boolean;
  };

export default function Stepper(props: StepperProps) {
  const { steps, value: activeStep, onChange, className = '' } = props;

  const handleStepClick = (index: number) => {
    if (index === activeStep) return;
    onChange(index);
  };

  const classes = twMerge('flex flex-col gap-5', 'md:flex-row', className);

  const isStepHighlighted = (step: number) => {
    return step <= activeStep;
  };

  return (
    <div>
      <div className={classes}>
        {steps.map((step, index) => (
          <Step
            key={index}
            value={index}
            title={step.title}
            subtitle={step.subtitle}
            isComplete={step.isComplete}
            isActive={index === activeStep}
            isHighlighted={isStepHighlighted(index)}
            disabled={index > 0 && !steps[index - 1].isComplete}
            onClick={() => handleStepClick(index)}
          />
        ))}
      </div>
    </div>
  );
}

function Step(props: StepProps) {
  const { title, subtitle, isActive, value, isHighlighted, isComplete, disabled, ...rest } = props;

  const buttonClasses = twMerge(
    'flex flex-col gap-1 pl-4 w-full h-full',
    'border-l-4 cursor-pointer',
    'disabled:cursor-default disabled:text-neutral-500',
    'md:border-l-0 md:border-t-4 md:pt-4',
    'transition-all duration-150 ease-in-out border-neutral-500 border-opacity-25',
    'hover:opacity-75',
    isHighlighted && 'border-purple border-opacity-100'
  );

  const titleClasses = twMerge('font-semibold', isHighlighted ? 'text-purple' : '');

  return (
    <button type="button" disabled={disabled} className={buttonClasses} {...rest}>
      <span className={titleClasses}>{title}</span>
      <span className="font-semibold flex-shrink-0 whitespace-nowrap">{subtitle}</span>
    </button>
  );
}
