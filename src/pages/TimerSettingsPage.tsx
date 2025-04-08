
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { TimerNotificationService, TimerSettings } from '@/services/timer/TimerNotificationService';
import { TimerService } from '@/services/timer/TimerService';
import TimerSelectionModal from '@/components/workout/timer/TimerSelectionModal';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import { toast } from 'sonner';
import TimerSettingsForm from '@/components/timer/TimerSettingsForm';

const TimerSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState<TimerSettings & { defaultDuration: number }>({
    soundEnabled: true,
    vibrationEnabled: true,
    notificationEnabled: true,
    defaultDuration: 90
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDurationSelector, setShowDurationSelector] = useState(false);
  
  // Load user timer settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, success } = await TimerService.getUserTimerSettings(user.id);
        
        if (success && data) {
          setSettings({
            soundEnabled: data.timer_sound_enabled,
            vibrationEnabled: data.timer_vibration_enabled,
            notificationEnabled: data.timer_notification_enabled,
            defaultDuration: data.default_rest_timer_seconds
          });
        }
      } catch (error) {
        console.error("[TimerSettingsPage] Error loading timer settings:", error);
        toast.error("Erro ao carregar configurações do timer");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [user]);
  
  // Save all settings at once
  const saveSettings = async () => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    try {
      setIsSaving(true);
      
      await TimerService.saveUserTimerSettings(user.id, {
        timer_sound_enabled: settings.soundEnabled,
        timer_vibration_enabled: settings.vibrationEnabled,
        timer_notification_enabled: settings.notificationEnabled,
        default_rest_timer_seconds: settings.defaultDuration
      });
      
      toast.success("Configurações salvas com sucesso");
    } catch (error) {
      console.error("[TimerSettingsPage] Error saving settings:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Test timer notifications
  const testTimerNotifications = () => {
    TimerNotificationService.notifyTimerComplete("Teste", settings);
    toast.info("Testando notificações do timer");
  };
  
  // Update a single setting
  const updateSetting = (key: keyof TimerSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle default duration change
  const handleDefaultDurationChange = (duration: number) => {
    setSettings(prev => ({ ...prev, defaultDuration: duration }));
    setShowDurationSelector(false);
  };

  return (
    <AuthRequiredRoute>
      <div className="pb-20">
        <PageHeader 
          title="Configurações do Timer" 
          showBackButton={true} 
          onBackClick={() => navigate(-1)} 
        />
        
        <TimerSettingsForm
          settings={settings}
          isLoading={isLoading}
          isSaving={isSaving}
          onUpdateSetting={updateSetting}
          onShowDurationSelector={() => setShowDurationSelector(true)}
          onTestNotifications={testTimerNotifications}
          onSaveSettings={saveSettings}
        />
        
        <TimerSelectionModal
          isOpen={showDurationSelector}
          onClose={() => setShowDurationSelector(false)}
          onSelectDuration={handleDefaultDurationChange}
          currentDuration={settings.defaultDuration}
        />
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default TimerSettingsPage;
