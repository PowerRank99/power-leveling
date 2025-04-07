
export const formatDuration = (seconds?: number | null) => {
  if (!seconds) return '0 min';
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
};

export const getTimeAgo = (dateStr?: string | null) => {
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
