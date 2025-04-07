
import React from 'react';
import { Home, Dumbbell, Trophy, UserCircle2, Search, Plus, ChevronLeft, ChevronRight, Filter, Edit } from 'lucide-react';

// Navigation Icons
export const HomeIcon = ({ className = "", active = false }) => (
  <Home className={`${className} ${active ? "fill-fitblue stroke-fitblue" : "stroke-gray-500"}`} />
);

export const WorkoutIcon = ({ className = "", active = false }) => (
  <Dumbbell className={`${className} ${active ? "fill-fitblue stroke-fitblue" : "stroke-gray-500"}`} />
);

export const RankingIcon = ({ className = "", active = false }) => (
  <Trophy className={`${className} ${active ? "fill-fitblue stroke-fitblue" : "stroke-gray-500"}`} />
);

export const ProfileIcon = ({ className = "", active = false }) => (
  <UserCircle2 className={`${className} ${active ? "fill-fitblue stroke-fitblue" : "stroke-gray-500"}`} />
);

// Utility Icons
export const SearchIcon = ({ className = "" }) => <Search className={className} />;
export const PlusIcon = ({ className = "" }) => <Plus className={className} />;
export const BackIcon = ({ className = "" }) => <ChevronLeft className={className} />;
export const ForwardIcon = ({ className = "" }) => <ChevronRight className={className} />;
export const FilterIcon = ({ className = "" }) => <Filter className={className} />;
export const EditIcon = ({ className = "" }) => <Edit className={className} />;
