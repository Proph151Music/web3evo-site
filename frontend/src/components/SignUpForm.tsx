import { isEmpty } from 'lodash';
import TextInput from './TextInput';
import { ChangeEventHandler } from 'react';
import Button from './ui/Button';

export interface InputProps {
  icon: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  text: string;
  type?: string;
  value?: string;
}

export interface SignUpFormProps {
  errors?: string[];
  inputs: InputProps[];
  label?: string;
  loading?: boolean;
  loadingLabel?: string;

  viewErrors?: boolean;
  onClick?: () => void;
}

export default function SignUpForm({
  errors,
  inputs,
  label,
  loading,
  loadingLabel,

  viewErrors,
  onClick
}: SignUpFormProps) {
  const textInputs = inputs.map((input) => (
    <TextInput
      key={input.text}
      icon={input.icon}
      onChange={input.onChange}
      placeholder={input.text}
      type={input.type}
      value={input.value}
    />
  ));
  const display = loading ? loadingLabel : label;
  return (
    <div className="signup-form">
      {textInputs}
      {!isEmpty(errors) && viewErrors && (
        <div>
          {errors?.map((error: string, idx: number) => {
            return (
              <p key={idx} className="text-sm text-red-600">
                {error}
              </p>
            );
          })}
        </div>
      )}

      <Button
        className="h-[46px]"
        disabled={loading}
        label={display || 'Create account'}
        onClick={onClick}
      />
    </div>
  );
}
