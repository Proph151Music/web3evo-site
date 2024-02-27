import { twMerge } from 'tailwind-merge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/Accordion';
import {
  ChangeEvent,
  MouseEventHandler,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState
} from 'react';
import TextInput, { InputProps } from '../ui/TextInput';
import { ChevronDownIcon, Cross2Icon, PlusIcon, UploadIcon } from '@radix-ui/react-icons';
import Button from '../ui/Button';
import SubFormWrapper from './SubFormWrapper';
import { NftCollectionRowData, NftTokenInput, SubFormProps } from '.';

type TokensSubFormProps = SubFormProps;

type TokenInputsGridProps = {
  className?: string;
  isNewButtonVisible: boolean;
  tokens: NftTokenInput[];
  onChange: (data: NftTokenInput[]) => void;
};

type TokenInputsRowProps = {
  className?: string;
  token: NftTokenInput;
  onChange: (data: NftTokenInput) => void;
  onRemove: () => void;
};

type FileInputProps = InputProps & {
  label?: string;
};

export default function TokensSubForm(props: TokensSubFormProps) {
  const { className, defaultCollections, steps, step, onStepChange, onSubmit, onBack } = props;
  const idsRef = useRef(0);
  const [collections, setCollections] = useState<NftCollectionRowData[]>(
    defaultCollections
      .sort((c1, c2) => c1.name.localeCompare(c2.name))
      .map((c) => ({ ...c, id: c.id || `${idsRef.current++}` }))
  );
  const [accordionValue, setAccordionValue] = useState<string | undefined>(collections[0]?.name);

  const displayedCollections = useMemo(() => {
    return collections.filter((c) => c.isSelected || c.isQueued);
  }, [collections]);

  const accordionClasses = twMerge('px-4 pb-4 overflow-auto flex flex-col h-full', className);

  const accordionItemClasses = twMerge(
    'relative border-b border-gray-600 h-full',
    'transition-basis duration-300 ease-in-out',
    'basis-0 data-[state=open]:basis-full'
  );

  const onTokensChange = useCallback(
    (collectionId: string, tokens: NftTokenInput[]) => {
      const collection = collections.find((c) => c.id === collectionId);
      if (collection) {
        collection.tokensToAdd = tokens;
        setCollections([...collections]);
      }
    },
    [collections]
  );

  const isFormValid = useMemo(
    () =>
      collections.every((collection) => {
        if (!collection.isQueued && !collection.isSelected) {
          return true;
        }
        if (collection.isQueued && collection.tokensToAdd.length === 0) {
          return true;
        }
        return (
          collection.tokensToAdd.length > 0 &&
          collection.tokensToAdd.every(
            (token) => token.name && token.imageFile && token.description
          )
        );
      }),
    [collections]
  );

  return (
    <SubFormWrapper
      steps={steps}
      step={step}
      onStepChange={onStepChange}
      canGoBack
      canProceed={isFormValid}
      onSubmit={() => onSubmit(collections)}
      onBack={() => onBack?.(collections)}
    >
      <Accordion
        collapsible
        type="single"
        value={accordionValue}
        onValueChange={setAccordionValue}
        className={accordionClasses}
      >
        {displayedCollections.map((collection) => (
          <AccordionItem
            key={collection.name}
            value={collection.name}
            className={accordionItemClasses}
          >
            <AccordionTrigger className="text-2xl outline-none">
              {collection.name}
              <ChevronDownIcon
                className={twMerge(
                  'h-4 w-4 shrink-0 transition-[transform,opacity] duration-[300ms,300ms] delay-150',
                  collection.name === accordionValue && 'opacity-0 rotate-180 duration-0'
                )}
              />
            </AccordionTrigger>
            <AccordionContent className="pt-[20px] pb-[40px] flex flex-col gap-2 data-[state=open]:overflow-y-auto">
              <TokenInputsGrid
                tokens={collection.tokensToAdd}
                isNewButtonVisible={collection.name === accordionValue}
                onChange={(tokens) => onTokensChange(collection.id, tokens)}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SubFormWrapper>
  );
}

function TokenInputsGrid(props: TokenInputsGridProps) {
  const { tokens: initialTokens, isNewButtonVisible, onChange } = props;
  const idsRef = useRef(0);
  const [tokens, setTokens] = useState<Array<NftTokenInput & { id?: number }>>(
    initialTokens.map((token) => ({ ...token, id: idsRef.current++ }))
  );

  return (
    <>
      <NewRowButton
        className={twMerge(
          'transition-opacity duration-300 opacity-0 absolute top-[20px] right-0',
          isNewButtonVisible && 'opacity-1 delay-300'
        )}
        onClick={(e) => {
          e.stopPropagation();
          idsRef.current++;
          tokens.push({ id: idsRef.current });
          onChange(tokens);
          setTokens([...tokens]);
        }}
      />
      {tokens.map((token, index) => (
        <TokenInputsRow
          key={token.id}
          token={token}
          onChange={(data) => {
            const newTokens = [...tokens];
            newTokens[index] = { ...newTokens[index], ...data };
            onChange(newTokens);
            setTokens(newTokens);
          }}
          onRemove={() => {
            const newTokens = [...tokens];
            newTokens.splice(index, 1);
            onChange(newTokens);
            setTokens(newTokens);
          }}
        />
      ))}
    </>
  );
}

function NewRowButton(props: {
  className?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  const { onClick, className } = props;

  const classes = twMerge(
    'flex flex-row items-center gap-2 text-purple p-0',
    'hover:border-b hover:border-b-purple',
    className
  );

  return (
    <span role="button" className={classes} onClick={onClick}>
      <PlusIcon width={16} height={16} />
      <span className="text-base font-medium">Add Token</span>
    </span>
  );
}

function TokenInputsRow(props: TokenInputsRowProps) {
  const { className, token, onChange, onRemove } = props;

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({ ...token, imageFile: file, fileName: file.name });
    }
  };

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...token, name: e.target.value });
  };

  const onDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...token, description: e.target.value });
  };

  return (
    <div className={twMerge('flex gap-10 items-center', className)}>
      <FileInput label={token.fileName} accept="image/*" onChange={onFileChange} required />
      <TokenInput
        value={token.name ?? ''}
        onChange={onNameChange}
        placeholder="Token's name"
        className="flex-1"
        required
      />
      <TokenInput
        value={token.description ?? ''}
        onChange={onDescriptionChange}
        placeholder="Token's description"
        className="flex-1"
        required
      />
      <Button variant="icon" onClick={onRemove}>
        <Cross2Icon width={18} height={18} />
      </Button>
    </div>
  );
}

const TokenInput = forwardRef<HTMLInputElement, InputProps>(({ className, ...inputProps }, ref) => {
  const inputClasses = useMemo(() => {
    return twMerge(
      'px-0 pl-2 pt-2 pb-0',
      'rounded-none',
      'bg-white bg-opacity-[0.05] rounded-t-lg border-0 outline-none',
      'caret-purple text-white'
    );
  }, []);

  return (
    <div className={twMerge(className, 'group relative')}>
      <TextInput ref={ref} className={inputClasses} {...inputProps} />
      <span
        className="
          ease absolute bottom-0 left-1/2 h-0 w-0 
          border-b-2 border-purple 
          transition-all duration-200 
          group-focus-within:w-full group-focus-within:left-0
        "
      />
      <span
        className="
          ease absolute bottom-0 left-0 right-0 h-0
          border-b-2 border-purple-faded 
        "
      />
    </div>
  );
});

const FileInput = forwardRef<HTMLInputElement, FileInputProps>((props, ref) => {
  const { className, label, onChange, ...inputProps } = props;
  const [localValue, setLocalValue] = useState<string | null>(null);

  const onValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setLocalValue(file.name);
      }
      onChange?.(event);
    },
    [onChange]
  );

  const classes = twMerge(
    'flex items-center gap-2 h-10 rounded-md px-3 py-2 max-w-[180px]',
    'cursor-pointer bg-purple',
    className
  );

  return (
    <label className={classes}>
      <UploadIcon width={18} height={18} />
      <span className="text-ellipsis whitespace-nowrap overflow-hidden font-normal">
        {localValue ?? label ?? 'Choose file'}
      </span>
      <input
        ref={ref}
        type="file"
        onChange={onValueChange}
        hidden
        className="hidden"
        {...inputProps}
      />
    </label>
  );
});
