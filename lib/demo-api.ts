import demoSeed from "../data/demo.json";
import type {
  Comment,
  CommentWithAuthor,
  Meetup,
  MeetupWithMeta,
  Post,
  PostWithMeta,
  Profile,
} from "../types/demo";

type Seed = {
  currentUserId: string;
  profiles: Profile[];
  posts: Post[];
  likes: { id: string; user_id: string; post_id: string }[];
  comments: Comment[];
  meetups: Meetup[];
  meetupParticipants: { id: string; meetup_id: string; user_id: string }[];
};

const deepClone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

let state: Seed = deepClone(demoSeed as Seed);

const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms));

function profileById(id: string): Profile | undefined {
  return state.profiles.find((p) => p.id === id);
}

function nextId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function getCurrentUserId() {
  return state.currentUserId;
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
      author: profileById(post.user_id),
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
    author: profileById(post.user_id),
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
  return state.comments
    .filter((c) => c.post_id === postId)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .map((c) => ({
      ...c,
      author: profileById(c.user_id),
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
      : [
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80",
        ];
  state.posts.unshift({
    id: nextId("p"),
    user_id: state.currentUserId,
    image_urls: urls,
    caption: input.caption.trim(),
    location: input.location.trim() || "Unknown",
    created_at: new Date().toISOString(),
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
        creator: profileById(m.creator_id),
        participantCount,
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
    creator: profileById(m.creator_id),
    participantCount,
    joinedByMe: state.meetupParticipants.some(
      (mp) => mp.meetup_id === m.id && mp.user_id === uid
    ),
    isFull: participantCount >= m.max_participants,
  };
}

export async function fetchMeetupParticipants(meetupId: string): Promise<Profile[]> {
  await delay(150);
  const ids = state.meetupParticipants
    .filter((mp) => mp.meetup_id === meetupId)
    .map((mp) => mp.user_id);
  return ids.map((id) => profileById(id)).filter(Boolean) as Profile[];
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

const DEFAULT_MEETUP_COVERS = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80",
];

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
  state.meetups.push({
    id,
    creator_id: state.currentUserId,
    title: input.title.trim(),
    description: input.description.trim(),
    location: input.location.trim(),
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
  return profileById(userId) ?? null;
}

/** Dev-only: reset in-memory DB to seed (optional hook). */
export function resetDemoData() {
  state = deepClone(demoSeed as Seed);
}
