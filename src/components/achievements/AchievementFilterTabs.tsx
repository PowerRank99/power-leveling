
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Trophy, Star, Flame, Zap, Shield, Crown } from 'lucide-react';

interface AchievementFilterTabsProps {
  value: string;
  onChange: (value: string) => void;
  type: 'status' | 'rank' | 'category';
  categories?: string[];
}

const AchievementFilterTabs: React.FC<AchievementFilterTabsProps> = ({ 
  value, 
  onChange, 
  type,
  categories = []
}) => {
  // Render different tab sets based on type
  if (type === 'status') {
    return (
      <Tabs 
        value={value} 
        onValueChange={onChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full bg-midnight-elevated border-b border-divider/30">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle data-[state=active]:border-arcane-30 rounded-full"
          >
            Todas
          </TabsTrigger>
          <TabsTrigger 
            value="unlocked" 
            className="data-[state=active]:bg-achievement-15 data-[state=active]:text-achievement data-[state=active]:shadow-glow-subtle data-[state=active]:border-achievement-30 rounded-full"
          >
            Desbloqueadas
          </TabsTrigger>
          <TabsTrigger 
            value="locked" 
            className="data-[state=active]:bg-midnight-card data-[state=active]:text-text-secondary data-[state=active]:shadow-glow-subtle data-[state=active]:border-divider/30 rounded-full"
          >
            Bloqueadas
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }
  
  if (type === 'rank') {
    return (
      <Tabs 
        value={value} 
        onValueChange={onChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-7 w-full bg-midnight-elevated border-b border-divider/30">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle data-[state=active]:border-arcane-30 rounded-full"
          >
            <Trophy className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger 
            value="E" 
            className="data-[state=active]:bg-midnight-card data-[state=active]:text-text-secondary data-[state=active]:shadow-glow-subtle data-[state=active]:border-divider/30 rounded-full"
          >
            <Award className="h-4 w-4 mr-1" />
            E
          </TabsTrigger>
          <TabsTrigger 
            value="D" 
            className="data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane data-[state=active]:shadow-glow-subtle data-[state=active]:border-arcane-30 rounded-full"
          >
            <Zap className="h-4 w-4 mr-1" />
            D
          </TabsTrigger>
          <TabsTrigger 
            value="C" 
            className="data-[state=active]:bg-arcane-15 data-[state=active]:text-arcane-60 data-[state=active]:shadow-glow-subtle data-[state=active]:border-arcane-30 rounded-full"
          >
            <Shield className="h-4 w-4 mr-1" />
            C
          </TabsTrigger>
          <TabsTrigger 
            value="B" 
            className="data-[state=active]:bg-valor-15 data-[state=active]:text-valor data-[state=active]:shadow-glow-subtle data-[state=active]:border-valor-30 rounded-full"
          >
            <Flame className="h-4 w-4 mr-1" />
            B
          </TabsTrigger>
          <TabsTrigger 
            value="A" 
            className="data-[state=active]:bg-achievement-15 data-[state=active]:text-achievement data-[state=active]:shadow-glow-subtle data-[state=active]:border-achievement-30 rounded-full"
          >
            <Star className="h-4 w-4 mr-1" />
            A
          </TabsTrigger>
          <TabsTrigger 
            value="S" 
            className="data-[state=active]:bg-achievement-15 data-[state=active]:text-achievement data-[state=active]:shadow-glow-gold data-[state=active]:border-achievement-30 rounded-full"
          >
            <Crown className="h-4 w-4 mr-1" />
            S
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }
  
  // Category tabs
  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-2 min-w-max">
        <button
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            value === 'all' 
              ? 'bg-arcane text-text-primary shadow-glow-purple' 
              : 'bg-midnight-elevated text-text-secondary hover:bg-midnight-card'
          }`}
          onClick={() => onChange('all')}
        >
          Todas Categorias
        </button>
        
        {categories.map(category => (
          <button
            key={category}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              value === category 
                ? 'bg-arcane text-text-primary shadow-glow-purple' 
                : 'bg-midnight-elevated text-text-secondary hover:bg-midnight-card'
            }`}
            onClick={() => onChange(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AchievementFilterTabs;
