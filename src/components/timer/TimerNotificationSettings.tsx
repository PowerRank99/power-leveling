
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TimerSettings } from '@/services/timer/TimerNotificationService';

interface TimerNotificationSettingsProps {
  settings: TimerSettings;
  onUpdateSetting: (key: keyof TimerSettings, value: boolean) => void;
  onTestNotifications: () => void;
}

const TimerNotificationSettings: React.FC<TimerNotificationSettingsProps> = ({
  settings,
  onUpdateSetting,
  onTestNotifications
}) => {
  return (
    <Card className="p-5 mb-6">
      <h2 className="text-xl font-bold mb-4">Notificações</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="sound" className="text-base">Som</Label>
            <p className="text-sm text-gray-500">Alerta sonoro quando o timer finalizar</p>
          </div>
          <Switch
            id="sound"
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => onUpdateSetting('soundEnabled', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="vibration" className="text-base">Vibração</Label>
            <p className="text-sm text-gray-500">Vibrar o dispositivo quando o timer finalizar</p>
          </div>
          <Switch
            id="vibration"
            checked={settings.vibrationEnabled}
            onCheckedChange={(checked) => onUpdateSetting('vibrationEnabled', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notification" className="text-base">Notificação</Label>
            <p className="text-sm text-gray-500">Mostrar notificação quando o timer finalizar</p>
          </div>
          <Switch
            id="notification"
            checked={settings.notificationEnabled}
            onCheckedChange={(checked) => onUpdateSetting('notificationEnabled', checked)}
          />
        </div>
        
        <Button
          onClick={onTestNotifications}
          variant="outline"
          className="w-full"
        >
          Testar Notificações
        </Button>
      </div>
    </Card>
  );
};

export default TimerNotificationSettings;
