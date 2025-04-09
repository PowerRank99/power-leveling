
import React, { useState } from 'react';
import { Heart, MessageCircle, Award, Flame, Star, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Post } from './PostList';
import { motion } from 'framer-motion';

interface EnhancedPostCardProps {
  post: Post;
}

const EnhancedPostCard: React.FC<EnhancedPostCardProps> = ({ post }) => {
  const [liked, setLiked] = useState(false);
  
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'Iniciante': return 'bg-green-100 text-green-700';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-700';
      case 'Avançado': return 'bg-purple-100 text-purple-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
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
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, type: "spring" }}
              >
                <Badge className="bg-green-100 text-green-700 px-3 py-1.5 text-sm font-medium">
                  +{reward.value} XP
                </Badge>
              </motion.div>
            );
          } else if (reward.type === 'achievement') {
            return (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, type: "spring" }}
              >
                <Badge className="bg-blue-100 text-blue-700 px-3 py-1.5 text-sm font-medium flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {reward.label}
                </Badge>
              </motion.div>
            );
          } else if (reward.type === 'streak') {
            return (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, type: "spring" }}
              >
                <Badge className="bg-orange-100 text-orange-700 px-3 py-1.5 text-sm font-medium flex items-center gap-1">
                  <Flame className="w-4 h-4" />
                  Streak: {reward.value} dias
                </Badge>
              </motion.div>
            );
          } else if (reward.type === 'badge') {
            return (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, type: "spring" }}
              >
                <Badge className="bg-purple-100 text-purple-700 px-3 py-1.5 text-sm font-medium flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {reward.label}
                </Badge>
              </motion.div>
            );
          }
          return null;
        })}
      </div>
      
      <div className="flex border-t border-gray-100 pt-3 text-gray-500 justify-between">
        <button 
          className={`flex items-center ${liked ? 'text-red-500' : 'text-gray-500'} transition-colors`}
          onClick={handleLike}
        >
          <Heart className={`w-5 h-5 mr-1 ${liked ? 'fill-red-500' : ''}`} />
          <span>{liked ? post.likes + 1 : post.likes}</span>
        </button>
        
        <button className="flex items-center text-gray-500">
          <MessageCircle className="w-5 h-5 mr-1" />
          <span>{post.comments}</span>
        </button>
        
        <button className="flex items-center text-gray-500">
          <Share2 className="w-5 h-5 mr-1" />
          <span>Compartilhar</span>
        </button>
      </div>
    </div>
  );
};

export default EnhancedPostCard;
