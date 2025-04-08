
import React from 'react';
import { Button } from '@/components/ui/button';
import TimerDurationSettings from './TimerDurationSettings';
import TimerNotificationSettings from './TimerNotificationSettings';
import { TimerSettings } from '@/services/timer/TimerNotificationService';

interface TimerSettingsFormProps {
  settings: TimerSettings & { defaultDuration: number };
  isLoading: boolean;
  isSaving: boolean;
  onUpdateSetting: (key: keyof TimerSettings, value: boolean) => void;
  onShowDurationSelector: () => void;
  onTestNotifications: () => void;
  onSaveSettings: () => void;
}

const TimerSettingsForm: React.FC<TimerSettingsFormProps> = ({
  settings,
  isLoading,
  isSaving,
  onUpdateSetting,
  onShowDurationSelector,
  onTestNotifications,
  onSaveSettings
}) => {
  if (isLoading) {
    return <div className="p-4 text-center">Carregando configurações...</div>;
  }

  return (
    <div className="p-4 bg-gray-50 min-h-[80vh]">
      <TimerDurationSettings
        defaultDuration={settings.defaultDuration}
        onShowDurationSelector={onShowDurationSelector}
      />
      
      <TimerNotificationSettings
        settings={settings}
        onUpdateSetting={onUpdateSetting}
        onTestNotifications={onTestNotifications}
      />
      
      <Button
        onClick={onSaveSettings}
        className="w-full"
        disabled={isSaving}
      >
        {isSaving ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  );
};

export default TimerSettingsForm;
