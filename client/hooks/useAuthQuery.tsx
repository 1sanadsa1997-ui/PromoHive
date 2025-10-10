import { useMutation, useQuery, UseMutationResult, UseQueryOptions } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { authFetch } from "@/lib/api";

export function useAuthQuery<TData = unknown, TError = Error>(
  queryKey: readonly unknown[] | string,
  url: string,
  options?: UseQueryOptions<TData, TError>
) {
  const { token } = useAuth();

  return useQuery<TData, TError>(queryKey as any, () => authFetch(url) as Promise<TData>, {
    enabled: !!token && (options?.enabled ?? true),
    ...options,
  });
}

export function useAuthMutation<TData = any, TVariables = any>(
  url: string,
  method: string = "POST"
): UseMutationResult<TData, Error, TVariables> {
  const { token } = useAuth();

  const mutationFn = (variables: TVariables) => {
    const init: RequestInit = {
      method,
      body: variables as any,
      headers: {},
    };

    // authFetch will attach token from localStorage, but keep token-based enablement
    if (!token) return Promise.reject(new Error("Not authenticated"));

    return authFetch(url, init) as Promise<TData>;
  };

  return useMutation<TData, Error, TVariables>(mutationFn);
}
