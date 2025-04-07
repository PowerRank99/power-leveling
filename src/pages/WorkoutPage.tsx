
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';

const WorkoutPage = () => {
  const navigate = useNavigate();
  
  // Mock data
  const savedRoutines = [
    { 
      id: "1", 
      name: "Treino A - Peito e Tríceps", 
      exercises: 8,
      lastDone: "3 dias atrás",
      duration: "45 min"
    },
    { 
      id: "2", 
      name: "Treino B - Costas e Bíceps", 
      exercises: 9,
      lastDone: "5 dias atrás",
      duration: "50 min"
    }
  ];
  
  const recentWorkouts = [
    {
      id: "1",
      name: "Treino de Pernas",
      date: "22 Jan, 2025",
      exercises: 6,
      sets: 24,
      prs: 2,
      xp: 120,
      duration: "55 min"
    },
    {
      id: "2",
      name: "Treino de Peito",
      date: "20 Jan, 2025",
      exercises: 5,
      sets: 20,
      prs: 1,
      xp: 100,
      duration: "45 min"
    }
  ];
  
  return (
    <div className="pb-20">
      <PageHeader title="Treino" showBackButton={false} />
      
      <div className="p-4 bg-gray-50">
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/criar-rotina')}
            className="flex-1 bg-fitblue text-white rounded-lg py-4 font-bold flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Criar Rotina
          </button>
          
          <button 
            onClick={() => navigate('/biblioteca-exercicios')}
            className="flex-1 bg-white border border-gray-300 rounded-lg py-4 font-bold flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explorar
          </button>
        </div>
        
        {/* Saved Routines */}
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Rotinas Salvas</h2>
          
          {savedRoutines.map(routine => (
            <div key={routine.id} className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
              <h3 className="font-bold text-lg">{routine.name}</h3>
              <div className="flex text-gray-500 text-sm mt-1 mb-2">
                <span>{routine.exercises} exercícios</span>
                <span className="mx-2">•</span>
                <span>Última vez: {routine.lastDone}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="bg-fitblue-50 text-fitblue-600 font-medium px-3 py-1 rounded-full text-sm">
                  {routine.duration}
                </span>
                
                <button 
                  onClick={() => navigate(`/treino-atual/${routine.id}`)}
                  className="bg-fitblue text-white rounded-lg px-4 py-2 font-medium flex items-center"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Iniciar Rotina
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Recent Workouts */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Treinos Recentes</h2>
          
          {recentWorkouts.map(workout => (
            <div key={workout.id} className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-lg">{workout.name}</h3>
                  <p className="text-gray-500 text-sm">{workout.date}</p>
                </div>
                <div className="text-fitgreen font-bold">+{workout.xp} XP</div>
              </div>
              
              <div className="flex mt-3 space-x-2">
                <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm">
                  <span className="font-medium">{workout.exercises}</span> exercícios
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm">
                  <span className="font-medium">{workout.sets}</span> séries
                </div>
                <div className="bg-fitblue-100 text-fitblue-700 rounded-lg px-3 py-1 text-sm">
                  <span className="font-medium">{workout.prs}</span> PRs
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default WorkoutPage;
