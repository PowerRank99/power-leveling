
// Class flavor text map
export const ClassFlavorMap: Record<string, string> = {
  'guerreiro': 'Domina a força bruta. Guerreiros ganham mais XP com pesos pesados.',
  'monge': 'Mestre do próprio corpo. Monges prosperam com exercícios corporais e consistência.',
  'ninja': 'Veloz como o vento. Ninjas se destacam em treinos intensos e rápidos.',
  'bruxo': 'Flexível e resiliente. Bruxos dominam a mobilidade e recuperação.',
  'paladino': 'Atleta versátil. Paladinos ganham bônus em esportes e treinos longos.',
  'sem classe': 'Escolha uma classe para desbloquear bônus de experiência.',
};

// Get class avatar image
export const getClassAvatarImage = (className: string): string => {
  // Default images for each class
  const avatarMap: Record<string, string> = {
    'guerreiro': '/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png',
    'monge': '/lovable-uploads/38b244e2-15ad-44b7-8d2d-48eb9e4227a8.png',
    'ninja': '/lovable-uploads/f018410c-9031-4726-b654-ec51c1bbd72b.png',
    'bruxo': '/lovable-uploads/174ea5f4-db2b-4392-a948-5ec67969f043.png',
    'paladino': '/lovable-uploads/7164b50e-55bc-43ae-9127-1c693ab31e70.png'
  };
  
  return avatarMap[className.toLowerCase()] || '/lovable-uploads/d84a92f5-828a-4ff9-a21b-3233e15d4276.png';
};

// Get class colors based on class name
export const getClassColors = (className: string): {
  border: string;
  accent: string;
  iconBg: string;
  shadow: string;
  textAccent: string;
  gradientBg: string;
} => {
  const lowerClass = className.toLowerCase();
  
  switch(lowerClass) {
    case 'guerreiro':
      return {
        border: 'border-red-500/30',
        accent: 'bg-red-500/15',
        iconBg: 'text-red-500',
        shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]',
        textAccent: 'text-red-500',
        gradientBg: 'bg-gradient-to-br from-red-600/20 to-red-700/10'
      };
    case 'monge':
      return {
        border: 'border-amber-500/30',
        accent: 'bg-amber-500/15',
        iconBg: 'text-amber-500',
        shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.4)]',
        textAccent: 'text-amber-500',
        gradientBg: 'bg-gradient-to-br from-amber-600/20 to-amber-700/10'
      };
    case 'ninja':
      return {
        border: 'border-emerald-500/30',
        accent: 'bg-emerald-500/15',
        iconBg: 'text-emerald-500',
        shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]',
        textAccent: 'text-emerald-500',
        gradientBg: 'bg-gradient-to-br from-emerald-600/20 to-emerald-700/10'
      };
    case 'bruxo':
      return {
        border: 'border-violet-500/30',
        accent: 'bg-violet-500/15',
        iconBg: 'text-violet-500',
        shadow: 'shadow-[0_0_15px_rgba(139,92,246,0.4)]',
        textAccent: 'text-violet-500',
        gradientBg: 'bg-gradient-to-br from-violet-600/20 to-violet-700/10'
      };
    case 'paladino':
      return {
        border: 'border-blue-500/30',
        accent: 'bg-blue-500/15',
        iconBg: 'text-blue-500',
        shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]',
        textAccent: 'text-blue-500',
        gradientBg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10'
      };
    default:
      return {
        border: 'border-arcane-30',
        accent: 'bg-arcane-15',
        iconBg: 'text-arcane-60',
        shadow: 'shadow-glow-purple',
        textAccent: 'text-arcane',
        gradientBg: 'bg-gradient-to-br from-arcane/20 to-arcane/10'
      };
  }
};

// Consolidate and translate bonuses
export const consolidateBonuses = (bonuses: Array<{description: string | React.ReactNode; value: string}>): Array<{description: string | React.ReactNode; value: string}> => {
  if (!bonuses || bonuses.length === 0) return [];
  
  // Filter out duplicates and English versions
  const seen = new Set();
  const uniqueBonuses = bonuses.filter(bonus => {
    if (typeof bonus.description !== 'string') return true;
    
    // Skip loading placeholders
    if (bonus.description.toString().includes('loading-text')) return true;
    
    const lowerDesc = bonus.description.toLowerCase();
    if (seen.has(lowerDesc)) return false;
    seen.add(lowerDesc);
    
    return true;
  }).map(bonus => {
    if (typeof bonus.description === 'string') {
      // Merge duplicate descriptions that might be in different languages
      if (bonus.description.toLowerCase().includes('compound lift') || 
          bonus.description.toLowerCase().includes('exercícios compostos')) {
        return {
          ...bonus,
          description: "+20% XP de exercícios compostos (agachamento, supino, terra)"
        };
      }
      if (bonus.description.toLowerCase().includes('strength') || 
          bonus.description.toLowerCase().includes('força')) {
        return {
          ...bonus,
          description: "+10% XP de todos os exercícios de força"
        };
      }
    }
    return bonus;
  });
  
  // Only return the first 2 bonuses
  return uniqueBonuses.slice(0, 2);
};
