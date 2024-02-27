import { useEffect, useState } from 'react';
import api, { UserProfile } from '../utils/api';

export default function useUserProfile({ username }: { username: string }) {
  const [userProfile, setUserProfile] = useState<UserProfile>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchUser() {
      if (username) {
        try {
          setLoading(true);
          const { data } = await api.getUserProfile({ username });
          setUserProfile(data);
        } catch (error) {
          console.log('ERROR GETTING USER', error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchUser();
  }, [username]);

  return { userProfile, loading };
}
