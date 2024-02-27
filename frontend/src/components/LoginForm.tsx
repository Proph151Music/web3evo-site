import TextInput from './TextInput';
import Button from './ui/Button';

export interface InputProps {
  icon: string;
  text: string;
}

export interface LoginFormProps {
  inputs: InputProps[];
}

export default function LoginForm({ inputs }: LoginFormProps) {
  const textInputs = inputs.map((input) => (
    <TextInput key={input.text} icon={input.icon} placeholder={input.text} />
  ));

  return (
    <div className="signup-form">
      {textInputs}
      <Button label="Login" />
    </div>
  );
}
