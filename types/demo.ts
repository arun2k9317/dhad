export type Profile = {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
  reputation_score: number;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  /** One or more photos; first is the cover thumbnail in lists. */
  image_urls: string[];
  caption: string;
  location: string;
  created_at: string;
};

export type Like = {
  id: string;
  user_id: string;
  post_id: string;
};

export type Comment = {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
};

export type Meetup = {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  location: string;
  datetime: string;
  max_participants: number;
  created_at: string;
  /** Hero image for list/detail cards */
  cover_image_url: string;
};

export type MeetupParticipant = {
  id: string;
  meetup_id: string;
  user_id: string;
};

export type PostWithMeta = Post & {
  author: Profile | undefined;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
};

export type CommentWithAuthor = Comment & {
  author: Profile | undefined;
};

export type MeetupWithMeta = Meetup & {
  creator: Profile | undefined;
  participantCount: number;
  joinedByMe: boolean;
  isFull: boolean;
};
