/**
 * UserContext.tsx
 */
import { createContext } from 'react';
import type { UserContextType } from '../../types';

// Create context for user info. Default is undefined if not wrapped in provider
export const UserContext = createContext<UserContextType | undefined>(undefined);
