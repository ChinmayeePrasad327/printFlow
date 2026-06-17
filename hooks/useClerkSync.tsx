import { useEffect } from 'react';
import { UsersService } from '../services/users';
import { setAuthToken, clearAuthToken } from '../services/api';

// Clerk React Native SDK imports
import { useAuth, useUser } from '@clerk/clerk-expo';

/**
 * Hook: useClerkSync
 * - Listens to Clerk auth state
 * - On sign-in, obtains Clerk session token and calls backend /api/users/sync
 * - Sets axios Authorization header via setAuthToken
 */
export const useClerkSync = () => {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      try {
        // obtain session token from Clerk
        const token = await getToken();
        if (!token) return;
        // set token in api instance
        setAuthToken(token);

        if (!user) return;

        const primaryEmail = (user.emailAddresses && user.emailAddresses[0] && user.emailAddresses[0].emailAddress) || user.primaryEmailAddress || user.email;

        const payload = {
          email: primaryEmail,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          rollNo: '',
          department: ''
        };

        // call backend sync (backend will bootstrap admin if email matches env)
        await UsersService.sync(payload);
      } catch (err) {
        console.warn('Clerk sync error', err);
      }
    };

    if (isSignedIn) {
      sync();
    } else {
      // clear auth header
      clearAuthToken();
    }

    return () => { mounted = false; };
  }, [isSignedIn, user, getToken]);
};
