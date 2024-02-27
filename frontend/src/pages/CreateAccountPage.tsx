import AuthPagesLayout from '../components/Layout/AuthPagesLayout';
import SignUpForm, { InputProps } from '../components/SignUpForm';
import { useUser } from '../context/UserContext';

export default function CreateAccountPage() {
  const { errors, loadingUser, signUpData, viewErrors, setSignUpData, signUpUser } = useUser();

  function handleSignUp(field: string, value: string) {
    setSignUpData({ ...signUpData, [field]: value });
  }

  const inputs: (InputProps & { id: string })[] = [
    {
      id: 'username',
      icon: '/assets/icons/User.svg',
      text: 'Username',
      value: signUpData.username,
      onChange: (e) => handleSignUp('username', e.target.value)
    },
    {
      id: 'email',
      icon: '/assets/icons/EnvelopeSimple-light-grey.svg',
      text: 'Email Address',
      value: signUpData.email,
      onChange: (e) => handleSignUp('email', e.target.value)
    },
    {
      id: 'password',
      icon: '/assets/icons/LockKey.svg',
      text: 'Password',
      type: 'password', // Specify type as password to mask input
      value: signUpData.password,
      onChange: (e) => handleSignUp('password', e.target.value)
    },
    {
      id: 'passwordConfirmation',
      icon: '/assets/icons/LockKey.svg',
      text: 'Confirm Password',
      type: 'password', // Specify type as password to mask input
      value: signUpData.passwordConfirmation,
      onChange: (e) => handleSignUp('passwordConfirmation', e.target.value)
    }
  ];

  return (
    <AuthPagesLayout>
      <div className="flex flex-col gap-6 p-8">
        <h1>Create Account</h1>
        <p>Welcome! enter your details and start creating, collecting and selling NFTs.</p>
        <SignUpForm
          errors={errors}
          inputs={inputs}
          loading={loadingUser}
          loadingLabel="Signing up..."
          viewErrors={viewErrors}
          onClick={signUpUser}
        />
      </div>
    </AuthPagesLayout>
  );
}
