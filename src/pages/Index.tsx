
import React, { useState, useEffect } from 'react';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import FeedHeader from '@/components/social/FeedHeader';
import FeedTabs from '@/components/social/FeedTabs';
import PostList, { Post } from '@/components/social/PostList';
import WelcomeHeader from '@/components/social/WelcomeHeader';
import { motion, AnimatePresence } from 'framer-motion';

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const IndexPage = () => {
  const [activeTab, setActiveTab] = useState<'todos' | 'guildas' | 'amigos'>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Initialize mock posts data
  useEffect(() => {
    const initPosts: Post[] = [
      {
        id: "1",
        user: { 
          name: "Pedro Santos", 
          avatar: "/lovable-uploads/d84a92f5-828a-4ff9-a21b-3233e15d4276.png",
          level: "Avançado"
        },
        content: "Completei meu treino de costas! 💪",
        time: "há 2 horas",
        likes: 12,
        comments: 3,
        rewards: [
          { type: 'xp', value: 150 },
          { type: 'achievement', label: 'Nova Conquista' }
        ]
      },
      {
        id: "2",
        user: { 
          name: "Ana Clara", 
          avatar: "/lovable-uploads/174ea5f4-db2b-4392-a948-5ec67969f043.png",
          level: "Intermediário"
        },
        content: "Treino de pernas finalizado! Novo recorde pessoal no agachamento 🎯",
        time: "há 3 horas",
        likes: 24,
        comments: 7,
        rewards: [
          { type: 'xp', value: 100 },
          { type: 'streak', value: 5 }
        ]
      },
      {
        id: "3",
        user: { 
          name: "Lucas Oliveira", 
          avatar: "/lovable-uploads/4c10aa78-e770-43d4-96a3-69b43638d90e.png",
          level: "Iniciante"
        },
        content: "Primeira semana de treinos completa! 🎯",
        time: "há 5 horas",
        likes: 18,
        comments: 5,
        rewards: [
          { type: 'xp', value: 75 },
          { type: 'badge', label: 'Novato Dedicado' }
        ]
      }
    ];
    
    setPosts(initPosts);
    
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Function to get posts based on active tab
  const getPostsForTab = () => {
    switch(activeTab) {
      case 'todos':
        return posts;
      case 'guildas':
        // In a real app, this would filter for guild posts
        return [];
      case 'amigos':
        // In a real app, this would filter for friends' posts
        return [];
      default:
        return posts;
    }
  };
  
  return (
    <div className="pb-20 bg-midnight-base min-h-screen">
      {/* Header */}
      <FeedHeader />
      
      <AnimatePresence>
        {isLoading ? (
          <motion.div 
            className="flex justify-center items-center min-h-[200px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-10 h-10 border-4 border-arcane/30 border-t-arcane rounded-full animate-spin"></div>
          </motion.div>
        ) : (
          <motion.div 
            className="px-4 py-3"
            variants={staggerContainerVariants}
            initial="hidden"
            animate="show"
            key="content"
          >
            {/* Welcome Section */}
            <motion.div variants={itemVariants}>
              <WelcomeHeader />
            </motion.div>
            
            {/* Featured Content section has been removed */}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tabs */}
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Post List with animation for tab changes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <PostList posts={getPostsForTab()} />
        </motion.div>
      </AnimatePresence>
      
      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};

export default IndexPage;
