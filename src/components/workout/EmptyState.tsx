
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  type: 'routines' | 'workouts';
}

const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const isRoutines = type === 'routines';
  
  const content = {
    routines: {
      title: 'Nenhuma rotina encontrada',
      description: 'Crie sua primeira rotina de treino para começar',
      icon: '📋',
      buttonText: 'Criar Rotina',
      buttonLink: '/treino/criar'
    },
    workouts: {
      title: 'Nenhum treino recente',
      description: 'Seus treinos aparecerão aqui quando você começar a treinar',
      icon: '💪',
      buttonText: 'Ver Exercícios',
      buttonLink: '/exercicios'
    }
  };
  
  const { title, description, icon, buttonText, buttonLink } = content[type];
  
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      
      <Link to={buttonLink}>
        <Button className="bg-blue-600 hover:bg-blue-700">
          {isRoutines && <Plus className="h-4 w-4 mr-2" />}
          {buttonText}
        </Button>
      </Link>
    </motion.div>
  );
};

export default EmptyState;
