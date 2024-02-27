import SignUpForm, { InputProps } from '../components/SignUpForm';
import EnvelopeSimple from '../assets/icons/EnvelopeSimple-light-grey.svg';
import LockKey from '../assets/icons/LockKey.svg';
import { useUser } from '../context/UserContext';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import AuthPagesLayout from '../components/Layout/AuthPagesLayout';

export default function LoginPage() {
  const [location, setLocation] = useLocation();

  const {
    email,
    user,
    errors,
    password,
    loadingUser,
    viewErrors,
    loginUser,
    setEmail,
    setPassword
  } = useUser();

  useEffect(() => {
    if (location === '/login' && user != null) {
      setLocation('/');
    }
  }, [location, setLocation, user]);

  const searchParams = new URLSearchParams(window.location.search);
  const success = searchParams.get('success') === 'true';

  const inputs: InputProps[] = [
    {
      icon: EnvelopeSimple,
      onChange: (e) => setEmail(e.target.value),
      text: 'Email',
      value: email
    },
    {
      icon: LockKey,
      onChange: (e) => setPassword(e.target.value),
      text: 'Password',
      type: 'password',
      value: password
    }
  ];

  return (
    <AuthPagesLayout>
      <div className="flex flex-col gap-6 p-8">
        {success && <p className="text-green-600 text-center">Account was created!</p>}
        <h1>Login...</h1>
        <p className="text-lg text-gray-450">Login To See A Whole New World Unfold...</p>
        <SignUpForm
          errors={errors}
          inputs={inputs}
          label="Login"
          loading={loadingUser}
          loadingLabel="Logging in..."
          viewErrors={viewErrors}
          onClick={() => loginUser({ email, password })}
        />
      </div>
    </AuthPagesLayout>
  );
}
