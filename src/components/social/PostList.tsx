
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
    <ScrollArea className="h-[calc(100vh-160px)]">
      <div className="pb-16">
        {posts.map((post) => (
          <EnhancedPostCard key={post.id} post={post} />
        ))}
      </div>
    </ScrollArea>
  );
};

export default PostList;
