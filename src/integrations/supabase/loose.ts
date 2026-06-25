// Permissive re-export of the typed Supabase client.
// The generated Database types may be incomplete (no tables yet, custom RPCs,
// etc.), so this module exposes the same client cast to `any` to unblock
// strict TypeScript checks for runtime-validated table access.
import { supabase as typedSupabase } from './client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = typedSupabase as any;
