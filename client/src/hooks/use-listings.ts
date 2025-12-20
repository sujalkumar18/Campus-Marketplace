import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type CreateListingInput = z.infer<typeof api.listings.create.input>;
type UpdateListingInput = z.infer<typeof api.listings.update.input>;
type ListingParams = z.infer<NonNullable<typeof api.listings.list.input>>;

export function useListings(filters?: ListingParams) {
  return useQuery({
    queryKey: [api.listings.list.path, filters],
    queryFn: async () => {
      const url = new URL(api.listings.list.path, window.location.origin);
      if (filters?.category) url.searchParams.set("category", filters.category);
      if (filters?.search) url.searchParams.set("search", filters.search);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch listings");
      return api.listings.list.responses[200].parse(await res.json());
    },
  });
}

export function useListing(id: number) {
  return useQuery({
    queryKey: [api.listings.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.listings.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch listing");
      return api.listings.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateListingInput) => {
      const res = await fetch(api.listings.create.path, {
        method: api.listings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create listing");
      return api.listings.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.listings.list.path] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateListingInput) => {
      const url = buildUrl(api.listings.update.path, { id });
      const res = await fetch(url, {
        method: api.listings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update listing");
      return api.listings.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [api.listings.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.listings.get.path, id] });
    },
  });
}
