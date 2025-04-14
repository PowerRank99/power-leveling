
import React, { Profiler, ProfilerOnRenderCallback, PropsWithChildren } from 'react';
import { logPerformanceMetric } from '@/utils/performanceMonitoring';

interface PerformanceMonitorProps {
  id: string;
  children: React.ReactNode;
  warnThreshold?: number; // milliseconds
}

/**
 * Component that wraps children with React Profiler to monitor performance
 */
const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  id,
  children,
  warnThreshold = 50
}) => {
  const handleRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    // Log the performance metric
    logPerformanceMetric({
      componentId: id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime
    });
  };
  
  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
};

export default PerformanceMonitor;
