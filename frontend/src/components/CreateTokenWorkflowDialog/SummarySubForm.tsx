import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import SubFormWrapper from './SubFormWrapper';
import { NftCollectionRowData, SubFormProps } from '.';

type SummaryProps = SubFormProps;

type SummarySectionProps = {
  className?: string;
  title: string;
  collections: NftCollectionRowData[];
};

export default function SummarySubForm(props: SummaryProps) {
  const { className, defaultCollections, steps, step, onStepChange, onBack, onSubmit } = props;

  const queuedCollections = useMemo(
    () => defaultCollections.filter((c) => c.isQueued).map((c) => ({ ...c, tokens: [] })),
    [defaultCollections]
  );

  const selectedCollections = useMemo(
    () =>
      defaultCollections
        .filter((c) => c.isSelected && !c.isQueued)
        .map((c) => ({ ...c, tokens: [] })),
    [defaultCollections]
  );

  const summarySectionClasses = 'flex-1 h-full flex-shrink-0 min-h-[280px]';

  return (
    <SubFormWrapper
      steps={steps}
      step={step}
      canGoBack
      canProceed
      primaryButtonText="Create Tokens"
      onBack={onBack}
      onStepChange={onStepChange}
      onSubmit={() => onSubmit(defaultCollections)}
      className="border-none"
    >
      <div className={className}>
        <section className="flex flex-col md:flex-row h-full overflow-auto">
          <SummarySection
            title="New Collections"
            collections={queuedCollections}
            className={summarySectionClasses}
          />
          <SummarySection
            title="Minted Collections"
            collections={selectedCollections}
            className={summarySectionClasses}
          />
        </section>
      </div>
    </SubFormWrapper>
  );
}

function SummarySection({ title, collections, className = '' }: SummarySectionProps) {
  const classes = twMerge(
    'h-full p-3 overflow-y-auto border-2 border-purple-faded rounded-xl',
    className
  );
  return (
    <div className={classes}>
      <h2 className="font-normal text-2xl">{title}</h2>
      <ul className="flex flex-col gap-4 px-2 py-4">
        {collections.map((collection) => (
          <li
            key={collection.name}
            className="flex justify-between items-center bg-purple bg-opacity-80 p-4 rounded-lg h-14"
          >
            <p className="font-medium text-lg">{collection.name}</p>
            <p className="font-light text-sm">{collection.tokensToAdd.length} Tokens</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
