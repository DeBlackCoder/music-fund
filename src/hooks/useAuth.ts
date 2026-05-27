import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, getErrorMessage } from '@/src/lib/api-client';
import { User } from '@/src/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role: 'artist';
  artistName?: string;
  phone?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

// Login
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await apiClient.post<{ success: boolean; data: AuthResponse }>(
        '/auth/login',
        credentials
      );
      return data.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['currentUser'], data.user);
    },
  });
}

// Register
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      const { data } = await apiClient.post<{ success: boolean; data: AuthResponse }>(
        '/auth/register',
        userData
      );
      return data.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['currentUser'], data.user);
    },
  });
}

// Get current user
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const { data } = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
      return data.data;
    },
    retry: false,
  });
}

// Logout
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('token');
      queryClient.clear();
    },
  });
}

// Check if user is authenticated
export function useIsAuthenticated() {
  const { data: user, isLoading } = useCurrentUser();
  return { isAuthenticated: !!user, user, isLoading };
}
