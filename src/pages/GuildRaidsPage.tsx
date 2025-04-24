
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { GuildRaidList, CreateRaidModal } from '@/components/guilds';
import { toast } from 'sonner';

const GuildRaidsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const handleJoinRaid = (raidId: string) => {
    // This will be implemented with Supabase integration
    console.log('Joining raid:', raidId);
    toast.success('Successfully joined the raid!');
  };
  
  const handleCreateRaid = () => {
    setIsCreateModalOpen(true);
  };
  
  const handleRaidCreated = (raidId: string) => {
    setIsCreateModalOpen(false);
    toast.success('Raid created successfully!');
  };
  
  // Mock data for initial UI
  const mockRaids = []; // We'll populate this with real data later
  
  return (
    <div className="min-h-screen bg-midnight-base pb-16">
      <PageHeader 
        title="Raids da Guilda"
        showBackButton={true}
      />
      
      <div className="p-4">
        <GuildRaidList
          raids={mockRaids}
          guildId={id || ''}
          isGuildMaster={true}
          onJoinRaid={handleJoinRaid}
          onCreateRaid={handleCreateRaid}
        />
      </div>
      
      <CreateRaidModal
        guildId={id || ''}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleRaidCreated}
      />
      
      <BottomNavBar />
    </div>
  );
};

export default GuildRaidsPage;
