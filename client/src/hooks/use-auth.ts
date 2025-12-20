import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

type LoginInput = z.infer<typeof api.auth.login.input>;
type RegisterInput = z.infer<typeof api.auth.register.input>;
type User = z.infer<typeof api.auth.login.responses[200]>;

export function useAuth() {
  const queryClient = useQueryClient();

  // Fake check-auth by creating a dummy user endpoint or just using local storage for MVP simulation
  // But for this code generation, we'll assume there is a /api/me endpoint implicitly or we just rely on login state
  // Since api definitions didn't include /me, we'll store user in localStorage for MVP demo persistence
  // In a real app, this would use an HTTP-only cookie and /api/me endpoint

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Invalid credentials");
      return await res.json() as User;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Registration failed");
      return await res.json() as User;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["user"], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Simulate logout
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
    },
  });

  return {
    user: queryClient.getQueryData<User>(["user"]),
    loginMutation,
    registerMutation,
    logoutMutation,
  };
}
