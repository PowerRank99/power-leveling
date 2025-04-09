
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import EnhancedPostCard from '@/components/social/EnhancedPostCard';

export interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
    level: string;
  };
  content: string;
  time: string;
  likes: number;
  comments: number;
  rewards: Array<
    | { type: 'xp'; value: number }
    | { type: 'achievement'; label: string }
    | { type: 'streak'; value: number }
    | { type: 'badge'; label: string }
  >;
}

interface PostListProps {
  posts: Post[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <div className="pb-16">
      {posts.map((post) => (
        <EnhancedPostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;
