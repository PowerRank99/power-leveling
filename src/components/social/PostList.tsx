
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Award, Flame, ChevronUp, Dumbbell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const navigate = useNavigate();
  
  if (posts.length === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <motion.div 
          className="bg-midnight-elevated rounded-xl p-8 border border-divider/20 shadow-subtle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div 
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-arcane-15 flex items-center justify-center border border-arcane-30"
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 0 rgba(124, 58, 237, 0.1)",
                "0 0 15px rgba(124, 58, 237, 0.4)",
                "0 0 0 rgba(124, 58, 237, 0.1)"
              ]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Dumbbell className="w-8 h-8 text-arcane" />
          </motion.div>
          <h3 className="font-orbitron text-lg mb-2 tracking-wide text-text-primary">Nenhuma Atividade</h3>
          <p className="text-text-secondary font-sora mb-6 max-w-xs mx-auto">
            Nenhuma atividade encontrada neste feed. Comece a treinar para compartilhar seu progresso!
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline" 
              className="bg-arcane-15 text-arcane border-arcane-30 hover:bg-arcane-30 hover:text-text-primary transition-all"
              onClick={() => navigate('/treino')}
            >
              Iniciar Treino
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-6 px-4">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.1,
            ease: [0.16, 1, 0.3, 1]
          }}
          whileHover={{ scale: 1.01 }}
          className="mb-4"
        >
          <Card className="premium-card hover:premium-card-elevated transition-all duration-300">
            <CardContent className="p-0">
              <div className="p-4 border-b border-divider/30">
                <div className="flex items-center mb-3">
                  <motion.div whileHover={{ scale: 1.1 }} className="mr-3">
                    <Avatar className="h-12 w-12 border-2 border-arcane-30 shadow-glow-purple transition-all duration-300 hover:shadow-glow-purple">
                      <AvatarImage src={post.user.avatar} alt={post.user.name} />
                      <AvatarFallback className="bg-arcane-15 text-arcane">
                        {post.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-orbitron font-bold text-lg tracking-wide">{post.user.name}</h3>
                        <p className="text-text-tertiary text-xs font-sora">{post.time}</p>
                      </div>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-arcane-15 text-arcane border border-arcane-30 shadow-glow-subtle font-space font-medium">
                              {post.user.level}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-midnight-elevated border border-arcane-30 text-text-primary text-xs">
                            Nível: {post.user.level}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
                
                <p className="mb-4 text-text-primary font-sora text-sm leading-relaxed">{post.content}</p>
              </div>
              
              <div className="px-4 py-3 flex justify-between items-center bg-midnight-elevated/50">
                <div className="flex gap-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-text-secondary hover:text-valor hover:bg-valor-15 px-2.5 h-10 rounded-full transition-all duration-200 group"
                        >
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="mr-1.5"
                          >
                            <Heart className="w-5 h-5 group-hover:fill-valor/20" />
                          </motion.div>
                          <span className="font-space">{post.likes}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-midnight-elevated border border-arcane-30 text-text-primary text-xs">
                        Curtir
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-text-secondary hover:text-arcane hover:bg-arcane-15 px-2.5 h-10 rounded-full transition-all duration-200 group"
                        >
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="mr-1.5"
                          >
                            <MessageCircle className="w-5 h-5 group-hover:fill-arcane/20" />
                          </motion.div>
                          <span className="font-space">{post.comments}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-midnight-elevated border border-arcane-30 text-text-primary text-xs">
                        Comentar
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex gap-2">
                  {post.rewards.map((reward, i) => {
                    if (reward.type === 'xp') {
                      return (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200 }}
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="flex items-center px-2 py-1 rounded-full bg-achievement-15 text-achievement border border-achievement-30 shadow-glow-gold"
                        >
                          <Award className="w-3.5 h-3.5 mr-1" />
                          <span className="text-xs font-space">+{reward.value} XP</span>
                        </motion.div>
                      );
                    } else if (reward.type === 'streak') {
                      return (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200 }}
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="flex items-center px-2 py-1 rounded-full bg-valor-15 text-valor border border-valor-30 shadow-glow-subtle"
                        >
                          <Flame className="w-3.5 h-3.5 mr-1" />
                          <span className="text-xs font-space">{reward.value} dias</span>
                        </motion.div>
                      );
                    } else if (reward.type === 'achievement' || reward.type === 'badge') {
                      return (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200 }}
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="flex items-center px-2 py-1 rounded-full bg-arcane-15 text-arcane border border-arcane-30 shadow-glow-purple"
                        >
                          <ChevronUp className="w-3.5 h-3.5 mr-1" />
                          <span className="text-xs font-space">{reward.label}</span>
                        </motion.div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default PostList;
