
import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';

interface PostCardProps {
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  time: string;
  likes: number;
  comments: number;
}

const PostCard: React.FC<PostCardProps> = ({
  user,
  content,
  time,
  likes,
  comments
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center mb-3">
        <img 
          src={user.avatar} 
          alt={user.name}
          className="w-12 h-12 rounded-full mr-3" 
        />
        <div>
          <h3 className="font-bold">{user.name}</h3>
          <p className="text-gray-500 text-sm">{time}</p>
        </div>
      </div>
      
      <p className="mb-4">{content}</p>
      
      <div className="flex text-gray-500">
        <button className="flex items-center mr-4">
          <Heart className="w-5 h-5 mr-1" />
          <span>{likes}</span>
        </button>
        
        <button className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-1" />
          <span>{comments}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
