import { PlusCircledIcon } from '@radix-ui/react-icons';
import api, { NftCollectionInput } from '../../utils/api';
import {
  Dialog,
  DialogCancel,
  DialogContent,
  DialogPortal,
  DialogTitle,
  DialogTrigger
} from '../ui/Dialog';
import { twMerge } from 'tailwind-merge';
import { KeyboardEvent, useCallback, useRef, useState } from 'react';
import TextInput from '../ui/TextInput';
import useQueryCallback from '../../hooks/use-query-callback';
import { useUser } from '../../context/UserContext';
import Button from '../ui/Button';

type NewCollectionDialogProps = {
  className?: string;
  queuedCollections: NftCollectionInput[];
  onSubmit: (data: NftCollectionInput) => void;
};

export default function NewCollectionDialog(props: NewCollectionDialogProps) {
  const { queuedCollections, onSubmit } = props;
  const [isOpen, setIsOpen] = useState(false);

  const { user } = useUser();
  const username = user?.username;

  if (!username) {
    throw new Error('User must be logged in to create a collection');
  }

  const collectionNameInputRef = useRef<HTMLInputElement>(null);
  const dialogContentClasses = twMerge(
    'flex flex-col bg-gray-700',
    'p-4 pt-4',
    'w-full h-full sm:w-[500px] sm:h-[300px]',
    'sm:shadow-2xl sm:shadow-purple-faded sm:border-2 sm:border-purple sm:rounded-3xl'
  );

  const submitCallback = useCallback(async () => {
    const name = collectionNameInputRef.current?.value.trim();
    if (!name) throw new Error('Collection name cannot be empty');

    const isQueued = queuedCollections.some((collection) => collection.name === name);
    if (isQueued) throw new Error('Collection name already queued');

    const isMinted = await api.getNftCollection({ name, username });
    if (isMinted) throw new Error('Collection name already minted');

    onSubmit?.({ name });
    setIsOpen(false);
  }, [onSubmit, queuedCollections, username]);

  const { error, loading, reset, query: submit } = useQueryCallback(submitCallback);

  const onEnterKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  const onOpenChangeHandler = (value: boolean) => {
    if (!value) reset();
    setIsOpen(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChangeHandler}>
      <DialogTrigger className="flex items-center gap-3 py-4 px-2 border-b border-b-gray-600 hover:bg-gray-700 cursor-pointer">
        <PlusCircledIcon width={30} height={30} className="text-purple" />
        <span className="font-light text-gray-100">Add a new collection</span>
      </DialogTrigger>
      <DialogPortal>
        <DialogContent
          className={dialogContentClasses}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            collectionNameInputRef.current?.focus();
          }}
        >
          <DialogTitle className="text-3xl mb-7">Create a new collection</DialogTitle>

          <DialogCancel />

          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="new-collection-name" className="ml-[2px] text-gray-200">
              Enter a unique collection name
            </label>
            <TextInput
              ref={collectionNameInputRef}
              id="new-collection-name"
              onKeyDown={onEnterKey}
              placeholder="e.g. My Collection"
              className="text-md"
            />
            {error && <p className="text-red-600 text-sm">{error.message}</p>}
          </div>

          <Button
            variant="primary"
            isLoading={loading}
            className="ml-auto h-12 w-full sm:w-[150px] "
            onClick={submit}
          >
            Submit
          </Button>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
