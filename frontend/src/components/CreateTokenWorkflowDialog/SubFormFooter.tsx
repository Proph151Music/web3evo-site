import Button from '../ui/Button';
import { twMerge } from 'tailwind-merge';

export type SubFormFooterProps = {
  className?: string;
  loading?: boolean;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  canProceed: boolean;
  canGoBack: boolean;
  onBack?: () => void;
  onSubmit: () => void;
};

export default function SubFormFooter(props: SubFormFooterProps) {
  const {
    className = '',
    loading = false,
    primaryButtonText = 'Next',
    secondaryButtonText = 'Back',
    canProceed,
    canGoBack,
    onBack,
    onSubmit
  } = props;

  const classes = twMerge('w-full flex flex-row-reverse items-center justify-between', className);

  return (
    <div className={classes}>
      <Button
        variant="primary"
        className="w-80"
        isLoading={loading}
        disabled={!canProceed}
        onClick={onSubmit}
      >
        {primaryButtonText}
      </Button>

      {canGoBack && (
        <Button variant="text" onClick={onBack}>
          {secondaryButtonText}
        </Button>
      )}
    </div>
  );
}
