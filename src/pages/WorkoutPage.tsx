
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface Routine {
  id: string;
  name: string;
  exercises_count?: number;
  last_used_at?: string | null;
}

interface RecentWorkout {
  id: string;
  name: string;
  date: string;
  exercises_count: number;
  sets_count: number;
  prs?: number;
  duration_seconds?: number | null;
}

const WorkoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedRoutines, setSavedRoutines] = useState<Routine[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserRoutines = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // Fetch user's routines
        const { data: routines, error: routinesError } = await supabase
          .from('routines')
          .select(`
            id, 
            name, 
            last_used_at,
            (SELECT count(*) FROM routine_exercises WHERE routine_id = routines.id) as exercises_count
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (routinesError) throw routinesError;
        
        if (routines && routines.length > 0) {
          setSavedRoutines(routines.map(r => ({
            id: r.id,
            name: r.name,
            exercises_count: r.exercises_count || 0,
            last_used_at: r.last_used_at,
          })));
        }
        
        // Fetch recent workouts
        const { data: workouts, error: workoutsError } = await supabase
          .from('workouts')
          .select(`
            id,
            started_at,
            completed_at,
            duration_seconds,
            routines (name),
            (SELECT count(*) FROM workout_sets WHERE workout_id = workouts.id) as sets_count,
            (SELECT count(DISTINCT exercise_id) FROM workout_sets WHERE workout_id = workouts.id) as exercises_count
          `)
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })
          .limit(5);
        
        if (workoutsError) throw workoutsError;
        
        if (workouts && workouts.length > 0) {
          setRecentWorkouts(workouts.map(w => ({
            id: w.id,
            name: w.routines?.name || 'Treino sem nome',
            date: new Date(w.started_at).toLocaleDateString('pt-BR'),
            exercises_count: w.exercises_count || 0,
            sets_count: w.sets_count || 0,
            prs: 0, // We'll implement this feature later
            duration_seconds: w.duration_seconds,
          })));
        }
      } catch (error) {
        console.error('Error fetching workout data:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar seus treinos. Tente novamente mais tarde.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserRoutines();
  }, [user, toast]);
  
  // Format workout duration
  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '0 min';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };
  
  // Calculate how long ago a workout was done
  const getTimeAgo = (dateStr?: string | null) => {
    if (!dateStr) return 'Nunca';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return `${Math.floor(diffDays / 30)} meses atrás`;
  };
  
  return (
    <AuthRequiredRoute>
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
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-fitblue border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500">Carregando suas rotinas...</p>
              </div>
            ) : savedRoutines.length > 0 ? (
              savedRoutines.map(routine => (
                <div key={routine.id} className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
                  <h3 className="font-bold text-lg">{routine.name}</h3>
                  <div className="flex text-gray-500 text-sm mt-1 mb-2">
                    <span>{routine.exercises_count} exercícios</span>
                    <span className="mx-2">•</span>
                    <span>Última vez: {getTimeAgo(routine.last_used_at)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="bg-fitblue-50 text-fitblue-600 font-medium px-3 py-1 rounded-full text-sm">
                      {routine.exercises_count} exercícios
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
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-200 text-center">
                <p className="text-gray-500 mb-4">Você ainda não tem rotinas salvas</p>
                <button 
                  onClick={() => navigate('/criar-rotina')}
                  className="bg-fitblue text-white rounded-lg px-4 py-2 font-medium"
                >
                  Criar Primeira Rotina
                </button>
              </div>
            )}
          </div>
          
          {/* Recent Workouts */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Treinos Recentes</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-fitblue border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500">Carregando seus treinos...</p>
              </div>
            ) : recentWorkouts.length > 0 ? (
              recentWorkouts.map(workout => (
                <div key={workout.id} className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{workout.name}</h3>
                      <p className="text-gray-500 text-sm">{workout.date}</p>
                    </div>
                    <div className="text-fitgreen font-bold">+{workout.exercises_count * 10} XP</div>
                  </div>
                  
                  <div className="flex mt-3 space-x-2">
                    <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm">
                      <span className="font-medium">{workout.exercises_count}</span> exercícios
                    </div>
                    <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm">
                      <span className="font-medium">{workout.sets_count}</span> séries
                    </div>
                    {workout.prs > 0 && (
                      <div className="bg-fitblue-100 text-fitblue-700 rounded-lg px-3 py-1 text-sm">
                        <span className="font-medium">{workout.prs}</span> PRs
                      </div>
                    )}
                    {workout.duration_seconds && (
                      <div className="bg-fitblue-50 text-fitblue-700 rounded-lg px-3 py-1 text-sm">
                        {formatDuration(workout.duration_seconds)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-200 text-center">
                <p className="text-gray-500">Você ainda não tem treinos registrados</p>
              </div>
            )}
          </div>
        </div>
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default WorkoutPage;
