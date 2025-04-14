
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { PerformanceMonitorService } from '@/services/common/PerformanceMonitorService';
import { CachingService } from '@/services/common/CachingService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const PerformanceDashboard = () => {
  const [cacheStats, setCacheStats] = useState({ size: 0, keys: [] });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const updateStats = () => {
      setCacheStats(CachingService.getCacheStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Performance Dashboard</h2>
      
      {/* Cache Statistics */}
      <Card className="p-4">
        <h3 className="text-xl font-semibold mb-3">Cache Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Cached Items</p>
            <p className="text-2xl font-bold">{cacheStats.size}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Cache Keys</p>
            <div className="max-h-40 overflow-y-auto">
              {cacheStats.keys.map((key) => (
                <div key={key} className="text-sm py-1 border-b">
                  {key}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <button 
        onClick={() => setRefreshKey(prev => prev + 1)}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
      >
        Refresh Stats
      </button>
    </div>
  );
};

export default PerformanceDashboard;
