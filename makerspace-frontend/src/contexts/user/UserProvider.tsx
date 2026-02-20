/**
 * UserProvider.tsx
 * UserProvider provides SSOT for logged in user information. Allows for conditional rendering
 * of certain page components. Used on pages to display admin options only to
 * users logged in as administrators.
 */

import React, { useMemo } from 'react';
import { useCookies } from 'react-cookie';
import { UserContext } from './UserContext';

// Provider to pass context info
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [cookies] = useCookies(['token', 'isAdmin']);

  // useMemo caches the value object and only recalculates if cookies change
  const value = useMemo(
    () => ({
      // Convert cookie strings to boolean values
      isAuthenticated: !!cookies.token,
      isAdmin: cookies.isAdmin === 'true' || cookies.isAdmin === true,
    }),
    [cookies.token, cookies.isAdmin],
  );

  // Wrap child prop with context provider so all nested components can access this context value
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
