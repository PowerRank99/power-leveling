
import React, { useState } from 'react';
import { SearchIcon, FilterIcon } from '@/components/icons/NavIcons';
import PageHeader from '@/components/ui/PageHeader';
import ExerciseCard from '@/components/workout/ExerciseCard';
import BottomNavBar from '@/components/navigation/BottomNavBar';

const ExerciseLibraryPage = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  
  const categories = [
    'Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Abdômen'
  ];
  
  // Mock data for exercises
  const exercises = [
    {
      id: "1",
      name: "Supino Reto",
      category: "Peito",
      level: "Iniciante" as const,
      type: "Composto" as const,
      image: "/lovable-uploads/7164b50e-55bc-43ae-9127-1c693ab31e70.png"
    },
    {
      id: "2",
      name: "Agachamento Livre",
      category: "Pernas",
      level: "Iniciante" as const,
      type: "Composto" as const,
      image: "/lovable-uploads/f018410c-9031-4726-b654-ec51c1bbd72b.png"
    },
    {
      id: "3",
      name: "Barra Fixa",
      category: "Costas",
      level: "Avançado" as const,
      type: "Composto" as const,
      image: "/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png"
    }
  ];
  
  // Filter exercises based on selected category
  const filteredExercises = activeCategory === 'Todos'
    ? exercises
    : exercises.filter(exercise => exercise.category === activeCategory);
  
  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      <PageHeader 
        title="Biblioteca de Exercícios" 
        rightContent={<SearchIcon className="w-6 h-6" />}
      />
      
      {/* Categories */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {categories.map(category => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-fitblue text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Exercise List */}
      <div className="p-4">
        {filteredExercises.map(exercise => (
          <ExerciseCard
            key={exercise.id}
            name={exercise.name}
            category={exercise.category}
            level={exercise.level}
            type={exercise.type}
            image={exercise.image}
          />
        ))}
      </div>
      
      <BottomNavBar />
    </div>
  );
};

export default ExerciseLibraryPage;
