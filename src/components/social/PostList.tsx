
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import EnhancedPostCard from '@/components/social/EnhancedPostCard';
import { motion } from 'framer-motion';

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
  if (posts.length === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Nenhuma atividade encontrada</h3>
        <p className="mt-1 text-sm text-gray-500">
          Acompanhe os treinos da comunidade nesta página.
        </p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="pb-16">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              ease: [0.23, 1, 0.32, 1]
            }}
          >
            <EnhancedPostCard post={post} />
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default PostList;
