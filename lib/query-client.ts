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
  /** Meetups whose location relates to a post’s place string (demo matching). */
  meetupsForLocation: (locationHint: string) =>
    ["meetups", "forLocation", locationHint] as const,
  meetup: (id: string) => ["meetup", id] as const,
  meetupParticipants: (id: string) => ["meetup", id, "participants"] as const,
  meetupMessages: (id: string) => ["meetup", id, "messages"] as const,
  coParticipantProfile: (meetupId: string, userId: string) =>
    ["meetup", meetupId, "coParticipantProfile", userId] as const,
  /** Prefix to invalidate all co-participant profile queries for a meetup (e.g. after join/leave). */
  coParticipantProfilesForMeetup: (meetupId: string) =>
    ["meetup", meetupId, "coParticipantProfile"] as const,
  profile: (id: string) => ["profile", id] as const,
  /** Demo: unread count for feed header avatar badge. */
  notificationUnread: ["notifications", "unread"] as const,
};
