import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { XPService } from '@/services/rpg/XPService';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Zap, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PowerDaySimulationProps {
  userId: string;
  addLogEntry: (action: string, details: string) => void;
}

const PowerDaySimulation: React.FC<PowerDaySimulationProps> = ({ userId, addLogEntry }) => {
  const [powerDayStatus, setPowerDayStatus] = useState({
    available: false,
    used: 0,
    max: 2,
    week: 0,
    year: 0
  });
  const [customXP, setCustomXP] = useState(200);
  const [isChecking, setIsChecking] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  
  useEffect(() => {
    if (userId) {
      checkPowerDayStatus();
    }
  }, [userId]);
  
  const checkPowerDayStatus = async () => {
    if (!userId) return;
    
    setIsChecking(true);
    try {
      const status = await XPService.checkPowerDayAvailability(userId);
      setPowerDayStatus(status);
      
      addLogEntry(
        'Power Day Status Checked', 
        `Available: ${status.available}, Used: ${status.used}/${status.max}, Week: ${status.week}/${status.year}`
      );
    } catch (error) {
      console.error('Error checking power day status:', error);
      toast.error('Error', {
        description: 'Failed to check power day status',
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  const activatePowerDay = async () => {
    if (!userId) {
      toast.error('Error', {
        description: 'Please select a test user',
      });
      return;
    }
    
    setIsActivating(true);
    try {
      // Get current week and year
      const now = new Date();
      const week = getWeekNumber(now);
      const year = now.getFullYear();
      
      // Record power day usage
      const recordSuccess = await XPService.recordPowerDayUsage(userId, week, year);
      
      if (!recordSuccess) {
        throw new Error('Failed to record power day usage');
      }
      
      // Award custom XP
      const xpSuccess = await XPService.awardXP(userId, customXP, 'power_day', {
        week,
        year,
        isPowerDay: true
      });
      
      if (!xpSuccess) {
        throw new Error('Failed to award XP');
      }
      
      // Update status
      await checkPowerDayStatus();
      
      // Record successful activation
      addLogEntry(
        'Power Day Activated', 
        `XP Awarded: ${customXP}, Week: ${week}/${year}`
      );
      
      toast.success('Power Day Activated!', {
        description: `${customXP} XP has been awarded with Power Day active.`,
      });
    } catch (error) {
      console.error('Error activating power day:', error);
      toast.error('Error', {
        description: 'Failed to activate power day: ' + (error instanceof Error ? error.message : 'Unknown error'),
      });
    } finally {
      setIsActivating(false);
    }
  };
  
  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };
  
  const getFormattedWeekRange = (week: number, year: number) => {
    if (week === 0) return 'Unknown';
    
    // Get the first day of the year
    const yearStart = new Date(year, 0, 1);
    
    // Calculate the first day of the week
    const daysToFirstWeek = (yearStart.getDay() > 0 ? 7 - yearStart.getDay() : 0);
    const firstWeekStart = new Date(year, 0, 1 + daysToFirstWeek);
    
    // Calculate first day of specified week
    const weekStart = new Date(firstWeekStart);
    weekStart.setDate(firstWeekStart.getDate() + (week - 1) * 7);
    
    // Calculate last day of specified week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    // Format dates
    const formatDate = (date: Date) => {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  };
  
  return (
    <Card className="premium-card border-arcane-30 shadow-glow-subtle">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-orbitron flex items-center">
          <Zap className="mr-2 h-5 w-5 text-achievement" />
          Power Day Simulation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="bg-midnight-card border border-divider/30 rounded-lg p-4">
              <h3 className="text-md font-orbitron mb-3 text-text-primary flex items-center">
                <Clock className="mr-2 h-4 w-4 text-arcane-60" />
                Current Power Day Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Available:</span>
                  <span className={`font-space ${powerDayStatus.available ? 'text-achievement' : 'text-valor-crimson'}`}>
                    {powerDayStatus.available ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Usage this week:</span>
                  <span className="font-space">
                    {powerDayStatus.used}/{powerDayStatus.max}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Current week:</span>
                  <span className="font-space">
                    Week {powerDayStatus.week}/{powerDayStatus.year}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Week range:</span>
                  <span className="font-space text-xs">
                    {getFormattedWeekRange(powerDayStatus.week, powerDayStatus.year)}
                  </span>
                </div>
                
                <div className="text-xs text-text-tertiary mt-3">
                  <p>Power Day allows you to exceed the daily 300 XP cap.</p>
                  <p>You can use Power Day twice per calendar week.</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={checkPowerDayStatus} 
              disabled={isChecking || !userId}
              variant="outline"
              className="w-full border-divider bg-midnight-elevated"
            >
              {isChecking ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full" />
                  Checking...
                </span>
              ) : (
                <span className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Refresh Power Day Status
                </span>
              )}
            </Button>
          </div>
          
          <div className="space-y-4 flex flex-col">
            <div className="bg-midnight-card rounded-lg p-4 border border-divider/30 flex-grow">
              <h3 className="text-md font-orbitron mb-3 text-text-primary">Custom XP Generation</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customXP">Custom XP Amount: {customXP}</Label>
                  <Slider
                    id="customXP"
                    min={50}
                    max={500}
                    step={10}
                    value={[customXP]}
                    onValueChange={(values) => setCustomXP(values[0])}
                    className="py-4"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Regular Daily Cap:</span>
                  <span className="font-space">300 XP</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Power Day Cap:</span>
                  <span className="font-space text-achievement">500 XP</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">XP to be awarded:</span>
                  <motion.span 
                    key={customXP}
                    className={`font-space text-lg ${customXP > 300 ? 'text-achievement' : 'text-arcane'}`}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {customXP} XP
                  </motion.span>
                </div>
                
                {customXP > 300 && (
                  <div className="text-xs text-achievement-60 mt-2">
                    <p>This amount exceeds the regular daily cap of 300 XP!</p>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              onClick={activatePowerDay} 
              disabled={isActivating || !userId || !powerDayStatus.available}
              className="w-full mt-auto bg-achievement hover:bg-achievement-60 text-midnight-deep transition-colors shadow-glow-gold"
            >
              {isActivating ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-midnight-deep rounded-full" />
                  Activating...
                </span>
              ) : (
                <span className="flex items-center">
                  <Zap className="mr-2 h-4 w-4" />
                  Activate Power Day &amp; Award XP
                </span>
              )}
            </Button>
            
            {!powerDayStatus.available && (
              <div className="text-xs text-valor-crimson text-center">
                <p>Power Day not available - already used {powerDayStatus.used}/{powerDayStatus.max} this week.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PowerDaySimulation;
