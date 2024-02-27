import { twMerge } from 'tailwind-merge';
import Button from '../ui/Button';

type WorkflowFooterProps = {
  canGoBack: boolean;
  canProceed: boolean;
  className?: string;
  onNext: () => void;
  onBack: () => void;
};

export default function WorkflowFooter(props: WorkflowFooterProps) {
  const { className = '', canGoBack, canProceed, onNext, onBack } = props;
  const classes = twMerge('flex flex-row-reverse items-center justify-between', className);

  return (
    <div className={classes}>
      <Button variant="primary" disabled={!canProceed} onClick={onNext} className="w-80">
        Next
      </Button>
      {canGoBack && (
        <Button variant="text" onClick={onBack}>
          Back
        </Button>
      )}
    </div>
  );
}
