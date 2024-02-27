import Button from '../ui/Button';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StepData } from './Stepper';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
} from '../ui/Dialog';
import SummarySubForm from './SummarySubForm';
import TokensSubForm from './TokensSubForm';
import CollectionsSubForm from './CollectionsSubForm';
import api, {
  NftCollection,
  NftCollectionInput,
  NftCollectionRequestBody,
  NftTokensRequestBody
} from '../../utils/api';
import { useUser } from '../../context/UserContext';
import useQueryCallback from '../../hooks/use-query-callback';
import { convertToBase64 } from '../../utils/file';

type CreateTokenWorkflowDialogProps = {
  disabled?: boolean;
  defaultCollections?: NftCollection[];
  onSubmit?: () => void;
};

export type NftTokenInput = {
  name?: string;
  imageFile?: File;
  fileName?: string;
  description?: string;
  collectionId?: string;
};

export type NftCollectionsInput = NftCollectionRequestBody['collections'];

export type NftCollectionRowData = NftCollection & {
  isQueued?: boolean;
  isSelected: boolean;
  tokensToAdd: NftTokenInput[];
};

export type SubFormProps = {
  className?: string;
  defaultCollections: NftCollectionRowData[];
  steps: StepData[];
  step: number;
  onStepChange: (step: number) => void;
  onBack?: (data?: NftCollectionRowData[]) => void;
  onSubmit: (data: NftCollectionRowData[]) => void;
};

export default function CreateTokenWorkflowDialog(props: CreateTokenWorkflowDialogProps) {
  const { defaultCollections, onSubmit } = props;
  const [step, setStep] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [collectionRows, setCollectionRows] = useState<NftCollectionRowData[]>(
    defaultCollections?.map<NftCollectionRowData>((collection) => ({
      ...collection,
      isQueued: false,
      isSelected: false,
      tokensToAdd: []
    })) ?? []
  );

  const { user } = useUser();
  const username = user?.username;

  if (!username) {
    throw new Error('You used CreateTokenWorkflowDialog outside of a user context');
  }

  /**********************************
   *          API QUERIES           *
   *********************************/
  const {
    query: mintQueuedCollections,
    reset: resetMintingCollectionsErrors,
    error: mintingCollectionsError
  } = useQueryCallback(async (collections: NftCollectionInput[]) => {
    return (await api.createNftCollections({ username, collections })).data;
  });

  const {
    query: mintNewTokens,
    reset: resetMintingTokensErrors,
    error: mintingTokensError
  } = useQueryCallback(async (tokens: NftTokensRequestBody['tokens']) => {
    return (await api.createNftTokens({ username, tokens })).data;
  });

  /**********************************
   *        COMPUTED VALUES         *
   *********************************/
  const selectedCollections = useMemo(() => {
    return collectionRows.filter((c) => c.isSelected || c.isQueued);
  }, [collectionRows]);

  const isStep1Complete = useMemo(() => {
    return selectedCollections.length > 0;
  }, [selectedCollections]);

  const isStep2Complete = useMemo(() => {
    return (
      isStep1Complete &&
      selectedCollections.every((c) => {
        if (c.isQueued && c.tokensToAdd.length === 0) {
          return true;
        }
        return (
          c.tokensToAdd.length > 0 &&
          c.tokensToAdd.every((token) => token.name && token.imageFile && token.description)
        );
      })
    );
  }, [isStep1Complete, selectedCollections]);

  const isStep3Complete = useMemo(() => {
    return isStep2Complete;
  }, [isStep2Complete]);

  const steps = useMemo(() => {
    return [
      { title: 'Step 1', subtitle: 'Select Collection', isComplete: isStep1Complete },
      { title: 'Step 2', subtitle: 'Mint Tokens', isComplete: isStep2Complete },
      { title: 'Step 3', subtitle: 'Summary', isComplete: isStep3Complete }
    ];
  }, [isStep1Complete, isStep2Complete, isStep3Complete]);

  /**********************************
   *        EVENT HANDLERS          *
   *********************************/
  const onOpenChangeHandler = useCallback(async (value: boolean) => {
    setStep(0);
    setIsDialogOpen(value);
  }, []);

  const onFinalSubmitHandler = useCallback(async () => {
    const queuedCollections = collectionRows.filter((c) => c.isQueued);
    const existingSelectedCollections = collectionRows.filter((c) => c.isSelected && !c.isQueued);
    const collectionsResponse =
      queuedCollections.length > 0 ? await mintQueuedCollections(queuedCollections) : undefined;

    const newCollectionsNameToId =
      collectionsResponse?.reduce(
        (acc, collection) => ({ ...acc, [collection.name]: collection.id }),
        {} as Record<string, string>
      ) ?? {};

    const tokens: NftTokenInput[] = [];
    for (const collection of existingSelectedCollections) {
      tokens.push(...collection.tokensToAdd.map((t) => ({ ...t, collectionId: collection.id })));
    }
    for (const collection of queuedCollections) {
      const collectionId = newCollectionsNameToId[collection.name];
      const mappedTokens = collection.tokensToAdd.map((t) => ({ ...t, collectionId }));
      tokens.push(...mappedTokens);
    }

    const mappedTokens = await Promise.all(
      tokens.map(async (t) => ({ ...t, image: await convertToBase64(t.imageFile) }))
    );

    const tokensResponse = await mintNewTokens(mappedTokens);

    if (!!tokensResponse) {
      onSubmit?.();
      setIsDialogOpen(false);
    }
  }, [collectionRows, mintNewTokens, mintQueuedCollections, onSubmit]);

  useEffect(() => {
    const errors = [mintingCollectionsError, mintingTokensError]
      .map((e) => e?.message ?? '')
      .join('\n')
      .trim();

    const resetErrors = () => {
      resetMintingCollectionsErrors();
      resetMintingTokensErrors();
    };

    if (errors.length) {
      alert(`The following errors occurred:\n${errors}`);
      resetErrors();
    }
  }, [
    mintingCollectionsError,
    mintingTokensError,
    resetMintingCollectionsErrors,
    resetMintingTokensErrors
  ]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={onOpenChangeHandler}>
      <DialogTrigger asChild>
        <Button
          nowrap
          variant="secondary"
          iconPath="/assets/icons/Plus.svg"
          disabled={props.disabled}
        >
          Create Tokens
        </Button>
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          className="
            flex flex-col pt-4 pb-4 px-4 
            w-full h-full lg:w-[1024px] lg:h-[900px] 
            lg:shadow-2xl lg:shadow-purple-faded lg:border-2 lg:border-purple lg:rounded-3xl
          "
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogClose asChild>
            <Button variant="icon" className="w-[30px] h-[30px] absolute top-2 right-2">
              <Cross2Icon width={20} height={20} />
            </Button>
          </DialogClose>

          <DialogTitle>Mint NFT Collections and Tokens</DialogTitle>

          {step === 0 && (
            <CollectionsSubForm
              steps={steps}
              step={step}
              onStepChange={setStep}
              defaultCollections={collectionRows}
              onSubmit={(collections) => {
                setStep(1);
                setCollectionRows(
                  collections.map((c) => {
                    c.tokensToAdd = c.isSelected || c.isQueued ? c.tokensToAdd : [];
                    return c;
                  })
                );
              }}
            />
          )}

          {step === 1 && (
            <TokensSubForm
              className="h-full"
              steps={steps}
              step={step}
              onStepChange={setStep}
              defaultCollections={collectionRows}
              onSubmit={(collections) => {
                setStep(2);
                setCollectionRows([...(collections ?? [])]);
              }}
              onBack={(collections) => {
                setStep(0);
                setCollectionRows([...(collections ?? [])]);
              }}
            />
          )}

          {step === 2 && (
            <SummarySubForm
              className="h-full"
              steps={steps}
              step={step}
              onStepChange={setStep}
              defaultCollections={collectionRows}
              onBack={() => setStep(1)}
              onSubmit={onFinalSubmitHandler}
            />
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
