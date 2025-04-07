
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import RankingCard from '@/components/ranking/RankingCard';
import BottomNavBar from '@/components/navigation/BottomNavBar';

const RankingPage = () => {
  const navigate = useNavigate();
  const [activePeriod, setActivePeriod] = useState<string>('Semanal');
  
  const periods = ['Semanal', 'Mensal', 'Trimestral', 'Anual'];
  
  // Mock data
  const pixelAvatar1 = "/lovable-uploads/4c10aa78-e770-43d4-96a3-69b43638d90e.png";
  const pixelAvatar2 = "/lovable-uploads/d84a92f5-828a-4ff9-a21b-3233e15d4276.png";
  const pixelAvatar3 = "/lovable-uploads/174ea5f4-db2b-4392-a948-5ec67969f043.png";
  
  const activeRankings = [
    {
      id: "1",
      title: "Desafio Força Total",
      participants: [
        { id: "1", name: "Você", avatar: pixelAvatar1, points: 920, position: 1, isCurrentUser: true },
        { id: "2", name: "João", avatar: pixelAvatar2, points: 850, position: 2 },
        { id: "3", name: "Maria", avatar: pixelAvatar3, points: 780, position: 3 }
      ],
      totalParticipants: 8
    }
  ];
  
  const pastRankings = [
    {
      id: "1",
      title: "Desafio de Verão",
      date: "Finalizado em 15/01/2025",
      position: 2,
      points: 890
    },
    {
      id: "2",
      title: "Maratona Fitness",
      date: "Finalizado em 01/01/2025",
      position: 1,
      points: 1020
    }
  ];
  
  const getPositionColor = (position: number) => {
    switch(position) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-500';
      case 3: return 'text-orange-500';
      default: return 'text-gray-700';
    }
  };
  
  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <PageHeader title="Competições" showBackButton={false} />
      
      <div className="flex justify-end px-4 pt-4">
        <button className="bg-fitblue text-white rounded-lg px-6 py-2 font-medium">
          Criar Ranking
        </button>
      </div>
      
      {/* Time Period Filter */}
      <div className="px-4 py-3 flex space-x-3 overflow-x-auto">
        {periods.map(period => (
          <button
            key={period}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap min-w-[100px] ${
              activePeriod === period
                ? 'bg-fitblue text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setActivePeriod(period)}
          >
            {period}
          </button>
        ))}
      </div>
      
      {/* Active Rankings */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Rankings Ativos</h2>
        
        {activeRankings.map(ranking => (
          <RankingCard 
            key={ranking.id}
            title={ranking.title}
            participants={ranking.participants}
            totalParticipants={ranking.totalParticipants}
            onClick={() => navigate(`/ranking/${ranking.id}`)}
          />
        ))}
        
        {/* Join New Ranking */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-fitblue-100 mr-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-fitblue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            
            <div className="flex-grow">
              <h3 className="font-bold text-lg">Entrar em Novo Ranking</h3>
              <p className="text-sm text-gray-500">Use um código de convite</p>
            </div>
            
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Past Rankings */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Rankings Anteriores</h2>
        
        {pastRankings.map(ranking => (
          <div key={ranking.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-lg">{ranking.title}</h3>
                <p className="text-sm text-gray-500">{ranking.date}</p>
              </div>
              
              <div className="text-right">
                <p className={`font-bold text-lg ${getPositionColor(ranking.position)}`}>
                  {ranking.position}º Lugar
                </p>
                <p className="text-sm text-gray-500">{ranking.points} pontos</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default RankingPage;
