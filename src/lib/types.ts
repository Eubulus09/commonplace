export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type PostKind = "art" | "work" | "research" | "note" | "milestone";

export type MediaItem = {
  path: string;
  alt: string;
};

export type ProfileLink = {
  label: string;
  url: string;
};

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  headline: string;
  practice: string;
  bio: string;
  location: string;
  links: ProfileLink[];
  avatar_path: string | null;
  cover_path: string | null;
  created_at: string;
};

export type PostStats = {
  post_id: string;
  likes: number;
  comments: number;
  bookmarks: number;
};

export type Post = {
  id: string;
  author_id: string;
  kind: PostKind;
  title: string | null;
  body: string;
  media: MediaItem[];
  tags: string[];
  created_at: string;
  updated_at: string;
  author: Profile;
  post_stats: PostStats[];
};

export type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  author: Profile;
};

export type FeedPost = Post & {
  liked: boolean;
  bookmarked: boolean;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Omit<Profile, "id" | "created_at">>;
        Relationships: [];
      };
      posts: {
        Row: Omit<Post, "author" | "post_stats">;
        Insert: {
          id?: string;
          author_id: string;
          kind: PostKind;
          title?: string | null;
          body: string;
          media?: MediaItem[];
          tags?: string[];
        };
        Update: {
          kind?: PostKind;
          title?: string | null;
          body?: string;
          media?: MediaItem[];
          tags?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      post_likes: {
        Row: { user_id: string; post_id: string; created_at: string };
        Insert: { user_id: string; post_id: string };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      post_bookmarks: {
        Row: { user_id: string; post_id: string; created_at: string };
        Insert: { user_id: string; post_id: string };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "post_bookmarks_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_bookmarks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: Omit<Comment, "author">;
        Insert: { post_id: string; author_id: string; parent_id?: string | null; body: string };
        Update: { body?: string };
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
        ];
      };
      follows: {
        Row: { follower_id: string; following_id: string; created_at: string };
        Insert: { follower_id: string; following_id: string };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      post_stats: {
        Row: PostStats;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      post_kind: PostKind;
    };
  };
}
