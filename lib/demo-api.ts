import demoSeed from "../data/demo.json";
import { DEMO_MEETUP_COVER_ROTATION, DEMO_POST_FALLBACK_IMAGE } from "./demo-food-images";
import { resolveDemoCoordsForLocationLabel } from "./demo-location-resolve";
import type {
  Comment,
  CommentWithAuthor,
  Meetup,
  MeetupMessage,
  MeetupMessageWithAuthor,
  MeetupWithMeta,
  Post,
  PostWithMeta,
  Profile,
} from "../types/demo";

type Seed = {
  currentUserId: string;
  /** Demo-only: unread in-app notifications for current user (badge on feed avatar). */
  unreadNotificationCount: number;
  profiles: Profile[];
  posts: Post[];
  likes: { id: string; user_id: string; post_id: string }[];
  comments: Comment[];
  meetups: Meetup[];
  meetupParticipants: { id: string; meetup_id: string; user_id: string }[];
  meetupMessages: MeetupMessage[];
};

const deepClone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

let state: Seed = deepClone(demoSeed as Seed);

const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms));

function profileById(id: string): Profile | undefined {
  return state.profiles.find((p) => p.id === id);
}

/** Personality fields are only exposed to self or via `fetchCoParticipantProfile`. */
function redactPersonalityTraits(p: Profile): Profile {
  return {
    ...p,
    food_preferences: [],
    hobbies: [],
    extracurricular_skills: [],
  };
}

function profileForViewer(viewerId: string, target: Profile | undefined): Profile | undefined {
  if (!target) return undefined;
  if (target.id === viewerId) return target;
  return redactPersonalityTraits(target);
}

function nextId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function isMeetupParticipant(meetupId: string, userId: string): boolean {
  return state.meetupParticipants.some(
    (mp) => mp.meetup_id === meetupId && mp.user_id === userId
  );
}

const MEETUP_AVATAR_PREVIEW_MAX = 6;

/** Stable order (by user id); capped previews for meetup list cards. */
function participantPreviewForMeetup(
  meetupId: string
): { user_id: string; avatar_url: string }[] {
  const ids = state.meetupParticipants
    .filter((mp) => mp.meetup_id === meetupId)
    .map((mp) => mp.user_id)
    .sort();
  const out: { user_id: string; avatar_url: string }[] = [];
  for (const id of ids) {
    const p = profileById(id);
    if (p?.avatar_url) {
      out.push({ user_id: id, avatar_url: p.avatar_url });
    }
    if (out.length >= MEETUP_AVATAR_PREVIEW_MAX) break;
  }
  return out;
}

export function getCurrentUserId() {
  return state.currentUserId;
}

export async function getUnreadNotificationCount(): Promise<number> {
  await delay(80);
  return Math.max(0, state.unreadNotificationCount ?? 0);
}

export async function fetchFeedPosts(): Promise<PostWithMeta[]> {
  await delay();
  const uid = state.currentUserId;
  return [...state.posts]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .map((post) => ({
      ...post,
      author: profileForViewer(uid, profileById(post.user_id)),
      likeCount: state.likes.filter((l) => l.post_id === post.id).length,
      likedByMe: state.likes.some(
        (l) => l.post_id === post.id && l.user_id === uid
      ),
      commentCount: state.comments.filter((c) => c.post_id === post.id).length,
    }));
}

export async function fetchPost(postId: string): Promise<PostWithMeta | null> {
  await delay();
  const post = state.posts.find((p) => p.id === postId);
  if (!post) return null;
  const uid = state.currentUserId;
  return {
    ...post,
    author: profileForViewer(uid, profileById(post.user_id)),
    likeCount: state.likes.filter((l) => l.post_id === post.id).length,
    likedByMe: state.likes.some(
      (l) => l.post_id === post.id && l.user_id === uid
    ),
    commentCount: state.comments.filter((c) => c.post_id === post.id).length,
  };
}

export async function fetchPostComments(
  postId: string
): Promise<CommentWithAuthor[]> {
  await delay(180);
  const uid = state.currentUserId;
  return state.comments
    .filter((c) => c.post_id === postId)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .map((c) => ({
      ...c,
      author: profileForViewer(uid, profileById(c.user_id)),
    }));
}

export async function toggleLike(postId: string): Promise<void> {
  await delay(120);
  const uid = state.currentUserId;
  const i = state.likes.findIndex(
    (l) => l.post_id === postId && l.user_id === uid
  );
  if (i >= 0) state.likes.splice(i, 1);
  else state.likes.push({ id: nextId("l"), user_id: uid, post_id: postId });
}

export async function addComment(postId: string, content: string): Promise<void> {
  await delay(200);
  const trimmed = content.trim();
  if (!trimmed) return;
  state.comments.push({
    id: nextId("c"),
    user_id: state.currentUserId,
    post_id: postId,
    content: trimmed,
    created_at: new Date().toISOString(),
  });
}

export async function deleteComment(commentId: string): Promise<void> {
  await delay(150);
  const uid = state.currentUserId;
  const c = state.comments.find((x) => x.id === commentId);
  if (c && c.user_id === uid) {
    state.comments = state.comments.filter((x) => x.id !== commentId);
  }
}

export async function deletePost(postId: string): Promise<void> {
  await delay(200);
  const uid = state.currentUserId;
  const p = state.posts.find((x) => x.id === postId);
  if (!p || p.user_id !== uid) return;
  state.posts = state.posts.filter((x) => x.id !== postId);
  state.likes = state.likes.filter((l) => l.post_id !== postId);
  state.comments = state.comments.filter((c) => c.post_id !== postId);
}

export async function createPost(input: {
  caption: string;
  location: string;
  imageUrls: string[];
}): Promise<void> {
  await delay(350);
  const urls =
    input.imageUrls.length > 0
      ? input.imageUrls
      : [DEMO_POST_FALLBACK_IMAGE];
  const loc = input.location.trim() || "Unknown";
  const coords = resolveDemoCoordsForLocationLabel(loc);
  state.posts.unshift({
    id: nextId("p"),
    user_id: state.currentUserId,
    image_urls: urls,
    caption: input.caption.trim(),
    location: loc,
    latitude: coords.latitude,
    longitude: coords.longitude,
    created_at: new Date().toISOString(),
  });
}

/** Heuristic match between a post’s place line and a meetup venue (demo / offline). */
export function meetupLocationMatchesPost(
  postLocation: string,
  meetupLocation: string
): boolean {
  const a = postLocation.toLowerCase().trim();
  const b = meetupLocation.toLowerCase().trim();
  if (!a || !b) return false;
  if (a === "unknown" || b === "unknown") return false;
  if (b.includes(a) || a.includes(b)) return true;
  const tokenize = (s: string) =>
    s.split(/[\s,·/]+/).filter((t) => t.length > 2);
  const tokensA = tokenize(a);
  const tokensB = tokenize(b);
  return (
    tokensA.some((t) => b.includes(t)) || tokensB.some((t) => a.includes(t))
  );
}

export async function fetchMeetupsForLocation(
  locationHint: string
): Promise<MeetupWithMeta[]> {
  await delay(200);
  const hint = locationHint.trim();
  if (!hint) return [];
  const uid = state.currentUserId;
  const filtered = state.meetups.filter((m) =>
    meetupLocationMatchesPost(hint, m.location)
  );
  return [...filtered]
    .sort(
      (a, b) =>
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    )
    .map((m) => {
      const participantCount = state.meetupParticipants.filter(
        (mp) => mp.meetup_id === m.id
      ).length;
      return {
        ...m,
        creator: profileForViewer(uid, profileById(m.creator_id)),
        participantCount,
        participantPreview: participantPreviewForMeetup(m.id),
        joinedByMe: state.meetupParticipants.some(
          (mp) => mp.meetup_id === m.id && mp.user_id === uid
        ),
        isFull: participantCount >= m.max_participants,
      };
    });
}

export async function fetchMeetups(): Promise<MeetupWithMeta[]> {
  await delay();
  const uid = state.currentUserId;
  return [...state.meetups]
    .sort(
      (a, b) =>
        new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    )
    .map((m) => {
      const participantCount = state.meetupParticipants.filter(
        (mp) => mp.meetup_id === m.id
      ).length;
      return {
        ...m,
        creator: profileForViewer(uid, profileById(m.creator_id)),
        participantCount,
        participantPreview: participantPreviewForMeetup(m.id),
        joinedByMe: state.meetupParticipants.some(
          (mp) => mp.meetup_id === m.id && mp.user_id === uid
        ),
        isFull: participantCount >= m.max_participants,
      };
    });
}

export async function fetchMeetup(meetupId: string): Promise<MeetupWithMeta | null> {
  await delay();
  const m = state.meetups.find((x) => x.id === meetupId);
  if (!m) return null;
  const uid = state.currentUserId;
  const participantCount = state.meetupParticipants.filter(
    (mp) => mp.meetup_id === m.id
  ).length;
  return {
    ...m,
    creator: profileForViewer(uid, profileById(m.creator_id)),
    participantCount,
    participantPreview: participantPreviewForMeetup(m.id),
    joinedByMe: state.meetupParticipants.some(
      (mp) => mp.meetup_id === m.id && mp.user_id === uid
    ),
    isFull: participantCount >= m.max_participants,
  };
}

export async function fetchMeetupParticipants(meetupId: string): Promise<Profile[]> {
  await delay(150);
  const uid = state.currentUserId;
  const ids = state.meetupParticipants
    .filter((mp) => mp.meetup_id === meetupId)
    .map((mp) => mp.user_id);
  return ids
    .map((id) => profileForViewer(uid, profileById(id)))
    .filter(Boolean) as Profile[];
}

/**
 * Full profile including personality traits — only when viewer and target are both
 * participants of the same meetup (co-participants).
 */
export async function fetchCoParticipantProfile(
  meetupId: string,
  targetUserId: string
): Promise<Profile | null> {
  await delay(200);
  const viewer = state.currentUserId;
  if (!isMeetupParticipant(meetupId, viewer)) return null;
  if (!isMeetupParticipant(meetupId, targetUserId)) return null;
  const p = profileById(targetUserId);
  return p ? { ...p } : null;
}

/** Joined participants only; returns empty if the current user is not in the meetup. */
export async function fetchMeetupMessages(
  meetupId: string
): Promise<MeetupMessageWithAuthor[]> {
  await delay(200);
  const uid = state.currentUserId;
  if (!isMeetupParticipant(meetupId, uid)) return [];
  return state.meetupMessages
    .filter((msg) => msg.meetup_id === meetupId)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .map((msg) => ({
      ...msg,
      author: profileById(msg.user_id),
    }));
}

export async function sendMeetupMessage(
  meetupId: string,
  content: string
): Promise<void> {
  await delay(220);
  const uid = state.currentUserId;
  if (!isMeetupParticipant(meetupId, uid)) {
    throw new Error("Join this meetup to send messages.");
  }
  const trimmed = content.trim();
  if (!trimmed) return;
  state.meetupMessages.push({
    id: nextId("mm"),
    meetup_id: meetupId,
    user_id: uid,
    content: trimmed,
    created_at: new Date().toISOString(),
  });
}

export async function joinMeetup(meetupId: string): Promise<void> {
  await delay(220);
  const uid = state.currentUserId;
  const m = state.meetups.find((x) => x.id === meetupId);
  if (!m) return;
  const count = state.meetupParticipants.filter(
    (mp) => mp.meetup_id === meetupId
  ).length;
  if (count >= m.max_participants) return;
  if (
    state.meetupParticipants.some(
      (mp) => mp.meetup_id === meetupId && mp.user_id === uid
    )
  ) {
    return;
  }
  state.meetupParticipants.push({
    id: nextId("mp"),
    meetup_id: meetupId,
    user_id: uid,
  });
}

export async function leaveMeetup(meetupId: string): Promise<void> {
  await delay(180);
  const uid = state.currentUserId;
  state.meetupParticipants = state.meetupParticipants.filter(
    (mp) => !(mp.meetup_id === meetupId && mp.user_id === uid)
  );
}

const DEFAULT_MEETUP_COVERS = [...DEMO_MEETUP_COVER_ROTATION];

export async function createMeetup(input: {
  title: string;
  description: string;
  location: string;
  datetime: string;
  max_participants: number;
  cover_image_url?: string;
}): Promise<string> {
  await delay(400);
  const id = nextId("m");
  const cover =
    input.cover_image_url?.trim() ||
    DEFAULT_MEETUP_COVERS[state.meetups.length % DEFAULT_MEETUP_COVERS.length];
  const loc = input.location.trim();
  const coords = resolveDemoCoordsForLocationLabel(loc);
  state.meetups.push({
    id,
    creator_id: state.currentUserId,
    title: input.title.trim(),
    description: input.description.trim(),
    location: loc,
    latitude: coords.latitude,
    longitude: coords.longitude,
    datetime: input.datetime,
    max_participants: Math.max(2, Math.min(50, input.max_participants)),
    created_at: new Date().toISOString(),
    cover_image_url: cover,
  });
  state.meetupParticipants.push({
    id: nextId("mp"),
    meetup_id: id,
    user_id: state.currentUserId,
  });
  return id;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  await delay(200);
  const p = profileById(userId);
  if (!p) return null;
  return profileForViewer(state.currentUserId, p) ?? null;
}

/** Dev-only: reset in-memory DB to seed (optional hook). */
export function resetDemoData() {
  state = deepClone(demoSeed as Seed);
}
