
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Award, Flame, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface PostReward {
  type: 'xp' | 'achievement' | 'streak' | 'badge';
  value?: number;
  label?: string;
}

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
  rewards: PostReward[];
}

interface PostListProps {
  posts: Post[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  if (posts.length === 0) {
    return (
      <div className="py-8 px-4 text-center">
        <p className="text-text-secondary font-sora">
          Nenhuma atividade encontrada neste feed.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-6 px-4">
      {posts.map((post) => (
        <Card key={post.id} className="mb-4 premium-card hover:premium-card-elevated transition-all duration-300">
          <CardContent className="p-0">
            <div className="p-4 border-b border-divider/30">
              <div className="flex items-center mb-3">
                <Avatar className="h-12 w-12 mr-3 border-2 border-arcane-30 shadow-glow-purple">
                  <AvatarImage src={post.user.avatar} alt={post.user.name} />
                  <AvatarFallback className="bg-arcane-15 text-arcane">
                    {post.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-orbitron font-bold">{post.user.name}</h3>
                      <p className="text-text-tertiary text-xs font-sora">{post.time}</p>
                    </div>
                    
                    <span className="text-xs px-2 py-0.5 rounded-full bg-arcane-15 text-arcane border border-arcane-30">
                      {post.user.level}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="mb-4 text-text-primary font-sora">{post.content}</p>
            </div>
            
            <div className="px-4 py-3 flex justify-between items-center bg-midnight-elevated/50">
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className="text-text-secondary hover:text-valor hover:bg-valor-15 px-2 h-8 rounded-full">
                  <Heart className="w-5 h-5 mr-1.5" />
                  <span className="font-space">{post.likes}</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="text-text-secondary hover:text-arcane hover:bg-arcane-15 px-2 h-8 rounded-full">
                  <MessageCircle className="w-5 h-5 mr-1.5" />
                  <span className="font-space">{post.comments}</span>
                </Button>
              </div>
              
              <div className="flex gap-2">
                {post.rewards.map((reward, i) => {
                  if (reward.type === 'xp') {
                    return (
                      <div key={i} className="flex items-center px-2 py-1 rounded-full bg-achievement-15 text-achievement border border-achievement-30">
                        <Award className="w-3.5 h-3.5 mr-1" />
                        <span className="text-xs font-space">+{reward.value} XP</span>
                      </div>
                    );
                  } else if (reward.type === 'streak') {
                    return (
                      <div key={i} className="flex items-center px-2 py-1 rounded-full bg-valor-15 text-valor border border-valor-30">
                        <Flame className="w-3.5 h-3.5 mr-1" />
                        <span className="text-xs font-space">{reward.value} dias</span>
                      </div>
                    );
                  } else if (reward.type === 'achievement' || reward.type === 'badge') {
                    return (
                      <div key={i} className="flex items-center px-2 py-1 rounded-full bg-arcane-15 text-arcane border border-arcane-30">
                        <ChevronUp className="w-3.5 h-3.5 mr-1" />
                        <span className="text-xs font-space">{reward.label}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PostList;
