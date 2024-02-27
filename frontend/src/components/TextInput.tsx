import { ChangeEventHandler } from 'react';

interface TextInputProps {
  icon?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  type?: string;
  value?: string;
}

export default function TextInput({
  icon,
  onChange,
  placeholder,
  type,
  value = ''
}: TextInputProps) {
  return (
    <div className="text-input">
      {icon && <img className="input-icon" src={icon} alt={icon} width={20} />}
      <input
        className="text-gray-700"
        type={type || 'text'}
        onChange={onChange ?? (() => {})}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
}
