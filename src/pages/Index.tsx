
import React from 'react';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import PostCard from '@/components/social/PostCard';

const IndexPage = () => {
  // Mock data
  const pixelAvatar1 = "/lovable-uploads/4c10aa78-e770-43d4-96a3-69b43638d90e.png";
  const pixelAvatar2 = "/lovable-uploads/d84a92f5-828a-4ff9-a21b-3233e15d4276.png";
  const pixelAvatar3 = "/lovable-uploads/174ea5f4-db2b-4392-a948-5ec67969f043.png";
  
  const posts = [
    {
      id: "1",
      user: { name: "João Silva", avatar: pixelAvatar2 },
      content: "Completei meu treino de costas! 💪 Novo PR no pull-up: 15 reps!",
      time: "Há 2 horas",
      likes: 24,
      comments: 8
    },
    {
      id: "2",
      user: { name: "Maria Santos", avatar: pixelAvatar3 },
      content: "Treino de pernas finalizado! 🏋️‍♀️ Superei minha meta no agachamento!",
      time: "Há 3 horas",
      likes: 31,
      comments: 12
    }
  ];
  
  const userAvatars = [
    { id: "1", name: "Você", avatar: pixelAvatar1 },
    { id: "2", name: "João", avatar: pixelAvatar2 },
    { id: "3", name: "Pedro", avatar: "/lovable-uploads/38b244e2-15ad-44b7-8d2d-48eb9e4227a8.png" }
  ];
  
  const quickActions = [
    { id: "1", name: "Treinar", icon: "fitblue" },
    { id: "2", name: "Ranking", icon: "fitgreen" },
    { id: "3", name: "Stats", icon: "fitpurple" },
    { id: "4", name: "Exercícios", icon: "orange" },
  ];
  
  return (
    <div className="pb-20">
      {/* App Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={pixelAvatar1} 
              alt="FitPixel Logo" 
              className="w-10 h-10 rounded-full mr-2"
            />
            <h1 className="text-xl font-bold">FitPixel</h1>
          </div>
          <div className="flex space-x-4">
            <button className="text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* User Avatars */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex justify-around">
          {userAvatars.map(user => (
            <div key={user.id} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-400 p-0.5">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="mt-1 text-sm">{user.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white p-4 border-b border-gray-200 mb-2">
        <div className="flex justify-around">
          {quickActions.map(action => (
            <div key={action.id} className="flex flex-col items-center">
              <div className={`w-14 h-14 rounded-full bg-${action.icon}-100 flex items-center justify-center`}>
                {action.name === "Treinar" && (
                  <svg className="w-6 h-6 text-fitblue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8l-6-6H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  </svg>
                )}
                {action.name === "Ranking" && (
                  <svg className="w-6 h-6 text-fitgreen" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                {action.name === "Stats" && (
                  <svg className="w-6 h-6 text-fitpurple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                )}
                {action.name === "Exercícios" && (
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )}
              </div>
              <span className="mt-1 text-sm">{action.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Social Feed */}
      <div>
        {posts.map(post => (
          <PostCard 
            key={post.id}
            user={post.user}
            content={post.content}
            time={post.time}
            likes={post.likes}
            comments={post.comments}
          />
        ))}
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default IndexPage;
