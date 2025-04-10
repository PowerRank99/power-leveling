
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, Award, Flame, Badge } from 'lucide-react';

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
    | { type: 'xp', value: number }
    | { type: 'streak', value: number }
    | { type: 'achievement', label: string }
    | { type: 'badge', label: string }
  >;
}

interface PostListProps {
  posts: Post[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  if (posts.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-text-secondary font-sora">Nenhuma atividade para mostrar.</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="premium-card hover:premium-card-elevated transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3 mb-3">
              <Avatar className="h-10 w-10 border border-divider">
                <AvatarImage src={post.user.avatar} />
                <AvatarFallback className="bg-midnight-elevated text-arcane font-orbitron">
                  {post.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-sora font-semibold text-text-primary">{post.user.name}</h3>
                  <span className="text-xs text-text-tertiary font-sora">{post.time}</span>
                </div>
                <p className="text-xs text-text-secondary font-sora">{post.user.level}</p>
              </div>
            </div>
            
            <p className="text-text-primary font-sora mb-3">{post.content}</p>
            
            <div className="flex flex-wrap gap-2">
              {post.rewards.map((reward, index) => {
                if (reward.type === 'xp') {
                  return (
                    <div key={index} className="inline-flex items-center px-2 py-1 rounded-full bg-achievement-15 text-achievement text-xs font-space border border-achievement-30 shadow-glow-gold">
                      <Award className="w-3.5 h-3.5 mr-1" />
                      +{reward.value} XP
                    </div>
                  );
                } else if (reward.type === 'streak') {
                  return (
                    <div key={index} className="inline-flex items-center px-2 py-1 rounded-full bg-valor-15 text-valor text-xs font-space border border-valor-30">
                      <Flame className="w-3.5 h-3.5 mr-1" />
                      {reward.value} dias
                    </div>
                  );
                } else if (reward.type === 'achievement' || reward.type === 'badge') {
                  return (
                    <div key={index} className="inline-flex items-center px-2 py-1 rounded-full bg-arcane-15 text-arcane text-xs font-space border border-arcane-30">
                      <Badge className="w-3.5 h-3.5 mr-1" />
                      {reward.label}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </CardContent>
          
          <CardFooter className="p-0 border-t border-divider">
            <div className="w-full grid grid-cols-2">
              <Button variant="ghost" className="rounded-none py-3 text-text-secondary hover:text-arcane hover:bg-arcane-15 flex justify-center">
                <ThumbsUp className="w-4 h-4 mr-2" />
                <span className="font-sora text-sm">{post.likes}</span>
              </Button>
              <Button variant="ghost" className="rounded-none py-3 text-text-secondary hover:text-arcane hover:bg-arcane-15 flex justify-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="font-sora text-sm">{post.comments}</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PostList;
