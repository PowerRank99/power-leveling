
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AchievementNotificationTester from '@/components/achievements/AchievementNotificationTester';

const AchievementNotificationTesterSection: React.FC = () => {
  return (
    <Card className="premium-card border-arcane-30 shadow-glow-subtle my-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-orbitron font-bold text-text-primary mb-4">
            Teste de Notificações de Conquistas
          </h3>
        </div>
        <div className="border-t border-divider/30 pt-4">
          <AchievementNotificationTester />
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementNotificationTesterSection;
