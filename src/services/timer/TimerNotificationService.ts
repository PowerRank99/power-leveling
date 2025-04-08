
import { toast } from 'sonner';

export interface TimerSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationEnabled: boolean;
}

/**
 * Service responsible for managing timer notifications
 */
export class TimerNotificationService {
  private static audioContext: AudioContext | null = null;
  private static audioBuffer: AudioBuffer | null = null;
  private static isAudioLoaded = false;
  
  /**
   * Initialize the audio context and preload sounds
   */
  static async initialize(): Promise<void> {
    if (typeof window !== 'undefined' && !this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        await this.loadTimerSound();
      } catch (error) {
        console.error("[TimerNotificationService] Error initializing audio:", error);
      }
    }
  }
  
  /**
   * Load the timer completion sound
   */
  private static async loadTimerSound(): Promise<void> {
    if (!this.audioContext || this.isAudioLoaded) return;
    
    try {
      // Simple beep sound generation
      const sampleRate = this.audioContext.sampleRate;
      const bufferSize = 2 * sampleRate; // 2 second buffer
      const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate a beep sound (sine wave)
      const frequency = 880; // Hz (A5)
      for (let i = 0; i < bufferSize; i++) {
        if (i < sampleRate * 0.5) { // First half second
          // Sine wave with fade in
          const fadeIn = Math.min(1, i / (sampleRate * 0.1));
          data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.5 * fadeIn;
        } else if (i < sampleRate * 0.8) {
          // Silent gap
          data[i] = 0;
        } else if (i < sampleRate * 1.3) {
          // Second beep with fade out
          const fadeOut = Math.max(0, 1 - (i - sampleRate * 1.1) / (sampleRate * 0.2));
          data[i] = Math.sin(2 * Math.PI * frequency * 1.2 * i / sampleRate) * 0.5 * fadeOut;
        } else {
          // Silent for the rest
          data[i] = 0;
        }
      }
      
      this.audioBuffer = buffer;
      this.isAudioLoaded = true;
      console.log("[TimerNotificationService] Timer sound loaded");
    } catch (error) {
      console.error("[TimerNotificationService] Error loading timer sound:", error);
    }
  }
  
  /**
   * Play the timer completion sound
   */
  static playSound(): void {
    if (!this.audioContext || !this.audioBuffer) {
      this.initialize();
      console.log("[TimerNotificationService] Audio not ready, initializing first");
      setTimeout(() => this.playSound(), 500);
      return;
    }
    
    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
      console.log("[TimerNotificationService] Playing timer sound");
    } catch (error) {
      console.error("[TimerNotificationService] Error playing sound:", error);
    }
  }
  
  /**
   * Trigger device vibration
   */
  static vibrate(): void {
    if ('vibrate' in navigator) {
      try {
        // Vibrate with pattern: 200ms on, 100ms off, 200ms on
        navigator.vibrate([200, 100, 200]);
        console.log("[TimerNotificationService] Device vibration triggered");
      } catch (error) {
        console.error("[TimerNotificationService] Error triggering vibration:", error);
      }
    } else {
      console.log("[TimerNotificationService] Device vibration not supported");
    }
  }
  
  /**
   * Show a timer completion notification
   */
  static showNotification(exerciseName: string): void {
    toast.success("Tempo de descanso finalizado", {
      description: `Pronto para continuar ${exerciseName}?`,
      duration: 5000
    });
    console.log(`[TimerNotificationService] Notification shown for ${exerciseName}`);
  }
  
  /**
   * Trigger all enabled notifications for timer completion
   */
  static notifyTimerComplete(exerciseName: string, settings: TimerSettings): void {
    if (settings.soundEnabled) {
      this.playSound();
    }
    
    if (settings.vibrationEnabled) {
      this.vibrate();
    }
    
    if (settings.notificationEnabled) {
      this.showNotification(exerciseName);
    }
  }
}

// Initialize audio on import
TimerNotificationService.initialize();
