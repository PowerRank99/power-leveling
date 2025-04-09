
import React from 'react';
import { Award, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Trophy from '@/components/icons/Trophy';
import StatCard from '@/components/profile/StatCard';

interface ProfileHeaderProps {
  avatar: string;
  name: string;
  username: string;
  level: number;
  className: string;
  workoutsCount: number;
  ranking: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatar,
  name,
  username,
  level,
  className,
  workoutsCount,
  ranking
}) => {
  return (
    <div className="bg-white p-6 relative">
      <div className="flex items-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-lg overflow-hidden">
            <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
          </div>
          
          {/* Level Badge */}
          <div className="absolute -bottom-2 -right-2 bg-fitblue text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
            <Award className="w-3 h-3 mr-1" /> {level}
          </div>
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="text-gray-600">@{username}</p>
            </div>
          </div>
          
          {/* Class Button */}
          <div className="mt-2">
            <Button 
              className="bg-fitblue text-white rounded-full text-sm flex items-center gap-1 px-3 py-1 h-auto"
            >
              <Trophy className="w-4 h-4" /> {className}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between mt-6 px-4 py-3 bg-gray-50 rounded-lg">
        <StatCard 
          icon={<Dumbbell className="w-5 h-5 text-fitblue" />}
          value={workoutsCount}
          label="Treinos"
        />
        
        <div className="h-10 w-px bg-gray-200 my-auto"></div>
        
        <StatCard 
          icon={<Trophy className="w-5 h-5 text-fitpurple" />}
          value={`#${ranking}`}
          label="Ranking"
        />
      </div>
    </div>
  );
};

export default ProfileHeader;
