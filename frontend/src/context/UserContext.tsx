import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, {
  LoginBody,
  LoginBodySchema,
  RegistrationBody,
  RegistrationBodySchema,
  User
} from '../utils/api';
import { useLocation } from 'wouter';

const DEFAULT_REGISTRATION_BODY = {
  username: '',
  email: '',
  password: '',
  passwordConfirmation: ''
};

interface UserValues {
  email: string;
  errors: string[];
  password: string;
  loadingUser: boolean;
  signUpData: RegistrationBody;
  user: User | null;
  viewErrors: boolean;
  message: ReactNode;
  loginUser: (values: LoginBody) => void;
  logoutUser: () => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setSignUpData: (signUpData: RegistrationBody) => void;
  signUpUser: () => void;
}

export const UserContext = createContext<UserValues>({
  email: '',
  errors: [],
  password: '',
  user: null,
  signUpData: DEFAULT_REGISTRATION_BODY,
  loadingUser: false,
  message: null,
  viewErrors: false,
  loginUser: () => Promise.resolve(),
  logoutUser: () => {},
  setEmail: () => {},
  setPassword: () => {},
  setSignUpData: () => {},
  signUpUser: () => {}
});

export const useUser = () => useContext(UserContext);

export default function UserContextProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();

  const [user, setUser] = useState<User | null>(null);

  const [signUpData, setSignUpData] = useState<RegistrationBody>(DEFAULT_REGISTRATION_BODY);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [viewErrors, setViewErrors] = useState<boolean>(false);
  const [message, setMessage] = useState<ReactNode>('');

  const refreshAccessToken = useCallback(async () => {
    try {
      const accessToken = window.localStorage.getItem('accessToken');

      if (accessToken) {
        setLoadingUser(true);
        const { user: fetchedUser, accessToken: newAccessToken } = (await api.refreshAccessToken())
          .data;

        window.localStorage.setItem('accessToken', newAccessToken);

        if (!user) {
          setUser(fetchedUser);
        }
      }
    } catch (e) {
      // Failed to authenticate
      console.error((e as Error).message);
      setUser(null);
      setLocation('/login');
    } finally {
      setLoadingUser(false);
    }
  }, [user, setLocation]);

  // Authenticate a possibly returning user when the page first loads
  useEffect(() => {
    refreshAccessToken();
  }, [refreshAccessToken]);

  // Refresh the access token every 14 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => refreshAccessToken(), 14 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [refreshAccessToken]);

  function displayErrors(errors: string[]) {
    setErrors(errors);
    setViewErrors(true);
  }

  function hideErrors() {
    setErrors([]);
    setViewErrors(false);
  }

  async function loginUser({ email, password }: LoginBody) {
    hideErrors();

    // Validate fields
    const parsedLoginBody = LoginBodySchema.safeParse({ email, password });
    if (!parsedLoginBody.success) {
      displayErrors(
        parsedLoginBody.error.errors.map((err) => `${err.path.join('.')} - ${err.message}`)
      );
      return;
    }

    // Send login request
    try {
      setLoadingUser(true);
      const response = await api.login({ email, password });
      const { user, accessToken } = response.data;

      window.localStorage.setItem('accessToken', accessToken);

      setUser(user);
      setLocation('/artist-page');
    } catch (error) {
      displayErrors([(error as Error)?.message || 'Unknown error']);
    } finally {
      setLoadingUser(false);
    }
  }

  const signUpUser = async () => {
    hideErrors();
    const parsedRegistrationBody = RegistrationBodySchema.safeParse(signUpData);

    // Validate fields
    if (!parsedRegistrationBody.success) {
      displayErrors([
        'Error signing up.',
        ...parsedRegistrationBody.error.errors.map(
          (err) => `${err.path.join('.')} - ${err.message}`
        )
      ]);
      return;
    }

    // Send registration request
    try {
      setLoadingUser(true);
      await api.register(signUpData);
      setMessage(<p className="text-green-600 text-center">Account was created!</p>);
      setLocation('/login?success=true');
    } catch (error) {
      displayErrors([(error as Error).message]);
    } finally {
      setLoadingUser(false);
    }
  };

  async function logoutUser() {
    await api.logout();
    setUser(null);
    window.localStorage.removeItem('accessToken');
    setLocation('/');
  }

  return (
    <UserContext.Provider
      value={{
        email,
        errors,
        loadingUser,
        password,
        signUpData,
        user,
        viewErrors,
        loginUser,
        logoutUser,
        message,
        setEmail,
        setPassword,
        setSignUpData,
        signUpUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
