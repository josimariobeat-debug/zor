import type { ReactNode } from 'react';
import { ConfirmProvider } from '@/components/ui/confirm-dialog';

/**
 * ⚠️ App-wide providers. Add new providers here — they'll be available in all routes.
 *
 * Example:
 *   import { MyProvider } from '@/contexts/my-context';
 *
 *   export function AppProviders({ children }: { children: ReactNode }) {
 *     return (
 *       <MyProvider>
 *         <ConfirmProvider>
 *           {children}
 *         </ConfirmProvider>
 *       </MyProvider>
 *     );
 *   }
 */

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConfirmProvider>
      {children}
    </ConfirmProvider>
  );
}
