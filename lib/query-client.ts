import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 20_000,
        retry: 1,
      },
    },
  });
}

export const queryKeys = {
  posts: ["posts"] as const,
  post: (id: string) => ["post", id] as const,
  postComments: (id: string) => ["post", id, "comments"] as const,
  meetups: ["meetups"] as const,
  meetup: (id: string) => ["meetup", id] as const,
  meetupParticipants: (id: string) => ["meetup", id, "participants"] as const,
  profile: (id: string) => ["profile", id] as const,
};
