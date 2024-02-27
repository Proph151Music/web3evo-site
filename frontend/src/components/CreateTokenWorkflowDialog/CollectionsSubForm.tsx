import { useCallback, useMemo, useState } from 'react';
import { NftCollectionRowData, SubFormProps } from '.';
import { NftCollectionInput } from '../../utils/api';
import * as Toggle from '@radix-ui/react-toggle';
import { twMerge } from 'tailwind-merge';
import Button from '../ui/Button';
import { MagnifyingGlassIcon, TrashIcon } from '@radix-ui/react-icons';
import Checkbox from '../ui/Checkbox';
import TextInput, { InputProps } from '../ui/TextInput';
import NewCollectionDialog from './NewCollectionDialog';
import SubFormWrapper from './SubFormWrapper';

type CollectionFormProps = SubFormProps;

type CollectionRowProps = {
  className?: string;
  isSelected?: boolean;
  collectionData: NftCollectionRowData;
  onSelectionChange?: (isSelected: boolean) => void;
  onRemove?: () => void;
};

export default function CollectionsSubForm(props: CollectionFormProps) {
  const { defaultCollections, onSubmit, steps, step, onStepChange } = props;
  const [search, setSearch] = useState('');
  const [collections, setCollections] = useState<NftCollectionRowData[]>(defaultCollections);

  const isRowSelected = (collection: NftCollectionRowData) => {
    return !!collection.isSelected;
  };

  const onCollectionRowSelectionChange = (index: number, isSelected: boolean) => {
    const collection: NftCollectionRowData = collections[index];
    collection.isSelected = isSelected;
    setCollections([...collections]);
  };

  const onNewCollectionDialogSubmitHandler = (collection: NftCollectionInput) => {
    const queuedCollection: NftCollectionRowData = {
      id: '',
      tokensCount: 0,
      logoUrl: '',
      isSelected: true,
      isQueued: true,
      dateMinted: new Date(),
      updatedAt: new Date(),
      tokensToAdd: [],
      ...collection
    };
    setCollections([...collections, queuedCollection]);
  };

  const onRemoveCollectionHandler = useCallback(
    (index: number) => {
      const clone = [...collections];
      clone.splice(index, 1);
      setCollections(clone);
    },
    [collections]
  );

  const queuedCollections = useMemo(() => {
    return collections.filter((c) => c.isQueued);
  }, [collections]);

  const displayedCollections = useMemo(() => {
    return collections.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [collections, search]);

  const canProceed = useMemo(() => {
    return collections.some((c) => c.isSelected || c.isQueued);
  }, [collections]);

  return (
    <SubFormWrapper
      steps={steps}
      step={step}
      onStepChange={onStepChange}
      canGoBack={false}
      canProceed={canProceed}
      onSubmit={() => onSubmit(collections)}
    >
      <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} />

      <NewCollectionDialog
        queuedCollections={queuedCollections}
        onSubmit={onNewCollectionDialogSubmitHandler}
      />

      <div className="overflow-y-auto h-full">
        {displayedCollections.map((collection, i) => (
          <CollectionRow
            key={`${collection.id}_${collection.name}_${i}`}
            collectionData={collection}
            isSelected={isRowSelected(collection)}
            onRemove={() => onRemoveCollectionHandler(i)}
            onSelectionChange={(selected) => onCollectionRowSelectionChange(i, selected)}
          />
        ))}
      </div>
    </SubFormWrapper>
  );
}

function SearchInput(props: InputProps) {
  const { className, ...inputProps } = props;

  const classes = twMerge(
    'flex items-center gap-2 pb-2 pt-1 px-2 border-b border-b-gray-600',
    className
  );

  return (
    <div className={classes}>
      <MagnifyingGlassIcon width={20} height={20} />
      <TextInput
        autoFocus
        placeholder="Select a collection to add your token to..."
        className="h-12 bg-transparent text-xl font-normal border-none text-white outline-none"
        {...inputProps}
      />
    </div>
  );
}

function CollectionRow(props: CollectionRowProps) {
  const { className = '', collectionData, isSelected = false, onSelectionChange, onRemove } = props;
  const { isQueued } = collectionData;

  const classes = twMerge(
    'group flex items-center gap-3',
    'py-4 px-4 border-b border-b-gray-600',
    'transition-colors duration-150 ease-in',
    isSelected ? 'bg-purple-faded hover:bg-purple hover:bg-opacity-30' : 'hover:bg-gray-700',
    isQueued ? 'cursor-default hover:bg-purple-faded' : 'cursor-pointer active:bg-gray-700',
    className
  );

  return (
    <Toggle.Root
      asChild
      disabled={isQueued}
      pressed={isSelected}
      onPressedChange={onSelectionChange}
    >
      <div className={classes}>
        <span
          className="w-12 h-12 rounded-xl bg-contain"
          style={{ backgroundImage: `url("${collectionData.logoUrl}")` }}
        />
        <span className="flex flex-col items-start">
          <p className="font-semibold">{collectionData.name}</p>
        </span>
        <span className="ml-auto  group-hover:block">
          {isQueued && (
            <Button
              onClick={onRemove}
              variant="icon"
              className="bg-white rounded-full hover:bg-white hover:bg-opacity-100 p-[2px] w-6 h-6"
            >
              <TrashIcon width={18} height={18} />
            </Button>
          )}
          {!isQueued && isSelected && <Checkbox checked />}
        </span>
      </div>
    </Toggle.Root>
  );
}
