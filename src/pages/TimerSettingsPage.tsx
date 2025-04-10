
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { TimerNotificationService, TimerSettings } from '@/services/timer/TimerNotificationService';
import { TimerService } from '@/services/timer/TimerService';
import TimerSelectionModal from '@/components/workout/timer/TimerSelectionModal';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import { toast } from 'sonner';

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
  
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AuthRequiredRoute>
      <div className="pb-20 min-h-screen bg-midnight-base">
        <PageHeader title="Configurações do Timer" showBackButton={true} onBackClick={() => navigate(-1)} />
        
        <div className="p-4">
          <Card className="premium-card p-5 mb-6 shadow-subtle">
            <h2 className="text-xl font-bold mb-4 font-orbitron text-text-primary">Tempo de Descanso Padrão</h2>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-text-secondary font-sora">Duração padrão</span>
              <Button
                onClick={() => setShowDurationSelector(true)}
                variant="outline"
                className="bg-midnight-elevated border-divider text-text-primary hover:bg-arcane-15 font-sora"
              >
                {formatDuration(settings.defaultDuration)}
              </Button>
            </div>
            
            <div className="mb-8">
              <p className="text-sm text-text-tertiary font-sora mb-2">
                Esta duração será usada como padrão para exercícios sem um tempo específico definido.
              </p>
            </div>
          </Card>
          
          <Card className="premium-card p-5 mb-6 shadow-subtle">
            <h2 className="text-xl font-bold mb-4 font-orbitron text-text-primary">Notificações</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sound" className="text-base text-text-primary font-sora">Som</Label>
                  <p className="text-sm text-text-tertiary font-sora">Alerta sonoro quando o timer finalizar</p>
                </div>
                <Switch
                  id="sound"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                  className="data-[state=checked]:bg-arcane"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vibration" className="text-base text-text-primary font-sora">Vibração</Label>
                  <p className="text-sm text-text-tertiary font-sora">Vibrar o dispositivo quando o timer finalizar</p>
                </div>
                <Switch
                  id="vibration"
                  checked={settings.vibrationEnabled}
                  onCheckedChange={(checked) => updateSetting('vibrationEnabled', checked)}
                  className="data-[state=checked]:bg-arcane"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notification" className="text-base text-text-primary font-sora">Notificação</Label>
                  <p className="text-sm text-text-tertiary font-sora">Mostrar notificação quando o timer finalizar</p>
                </div>
                <Switch
                  id="notification"
                  checked={settings.notificationEnabled}
                  onCheckedChange={(checked) => updateSetting('notificationEnabled', checked)}
                  className="data-[state=checked]:bg-arcane"
                />
              </div>
              
              <Button
                onClick={testTimerNotifications}
                variant="outline"
                className="w-full bg-midnight-elevated border-divider text-text-primary hover:bg-arcane-15 font-sora"
              >
                Testar Notificações
              </Button>
            </div>
          </Card>
          
          <Button
            onClick={saveSettings}
            className="w-full bg-arcane hover:bg-arcane-60 text-text-primary shadow-glow-subtle font-sora"
            disabled={isLoading || isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
        
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
