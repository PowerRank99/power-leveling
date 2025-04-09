
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardList, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const ActionsBar = () => {
  return (
    <motion.div 
      className="flex gap-2 justify-between"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to="/treino/criar" className="flex-1">
        <Button 
          variant="default" 
          className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm transition-all hover:shadow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Rotina
        </Button>
      </Link>
      
      <Link to="/exercicios" className="flex-1">
        <Button 
          variant="outline"
          className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 transition-all"
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          Exercícios
        </Button>
      </Link>
      
      <Link to="/configuracoes/timer" className="flex-shrink-0">
        <Button
          variant="outline"
          size="icon"
          className="border-blue-200 text-blue-600 hover:bg-blue-50 h-full transition-all"
          title="Configurações do Timer"
        >
          <Clock className="h-4 w-4" />
        </Button>
      </Link>
    </motion.div>
  );
};

export default ActionsBar;
