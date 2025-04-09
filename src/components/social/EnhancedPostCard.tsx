
import React from 'react';
import { Heart, MessageCircle, Award, Flame, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Post } from './PostList';

interface EnhancedPostCardProps {
  post: Post;
}

const EnhancedPostCard: React.FC<EnhancedPostCardProps> = ({ post }) => {
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'Iniciante': return 'bg-green-100 text-green-700';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-700';
      case 'Avançado': return 'bg-purple-100 text-purple-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-start space-x-3 mb-3">
        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
          <AvatarImage src={post.user.avatar} alt={post.user.name} />
          <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-base">{post.user.name}</h3>
              <p className="text-gray-500 text-sm">{post.time}</p>
            </div>
            <Badge className={`${getLevelColor(post.user.level)} font-medium`}>
              {post.user.level}
            </Badge>
          </div>
        </div>
      </div>
      
      <p className="mb-4 text-base">{post.content}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {post.rewards.map((reward, index) => {
          if (reward.type === 'xp') {
            return (
              <Badge key={index} className="bg-green-100 text-green-700 px-3 py-1.5 text-sm font-medium">
                +{reward.value} XP
              </Badge>
            );
          } else if (reward.type === 'achievement') {
            return (
              <Badge key={index} className="bg-blue-100 text-blue-700 px-3 py-1.5 text-sm font-medium flex items-center gap-1">
                <Award className="w-4 h-4" />
                {reward.label}
              </Badge>
            );
          } else if (reward.type === 'streak') {
            return (
              <Badge key={index} className="bg-orange-100 text-orange-700 px-3 py-1.5 text-sm font-medium flex items-center gap-1">
                <Flame className="w-4 h-4" />
                Streak: {reward.value} dias
              </Badge>
            );
          } else if (reward.type === 'badge') {
            return (
              <Badge key={index} className="bg-purple-100 text-purple-700 px-3 py-1.5 text-sm font-medium flex items-center gap-1">
                <Star className="w-4 h-4" />
                {reward.label}
              </Badge>
            );
          }
          return null;
        })}
      </div>
      
      <div className="flex border-t border-gray-100 pt-3 text-gray-500">
        <button className="flex items-center mr-6">
          <Heart className="w-5 h-5 mr-1" />
          <span>{post.likes}</span>
        </button>
        
        <button className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-1" />
          <span>{post.comments}</span>
        </button>
      </div>
    </div>
  );
};

export default EnhancedPostCard;
