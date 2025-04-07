
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ActionsBar: React.FC = () => {
  const navigate = useNavigate();
  
  return (
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
  );
};

export default ActionsBar;
