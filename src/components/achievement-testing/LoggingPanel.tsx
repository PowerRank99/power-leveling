
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, Trash2, Clock } from 'lucide-react';

interface LogEntry {
  timestamp: Date;
  action: string;
  details: string;
}

interface LoggingPanelProps {
  logEntries: LogEntry[];
  clearLogs: () => void;
}

const LoggingPanel: React.FC<LoggingPanelProps> = ({ logEntries, clearLogs }) => {
  const exportLogs = () => {
    const formattedLogs = logEntries.map(log => ({
      timestamp: log.timestamp.toISOString(),
      action: log.action,
      details: log.details
    }));
    
    const jsonString = JSON.stringify(formattedLogs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `achievement-testing-log-${new Date().toISOString().substring(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    });
  };
  
  return (
    <Card className="premium-card border-arcane-30 shadow-glow-subtle h-[500px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-orbitron flex items-center">
            <FileText className="mr-2 h-5 w-5 text-arcane" />
            Achievement Testing Logs
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-midnight-elevated border-divider"
              onClick={exportLogs}
              disabled={logEntries.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-valor-crimson border-valor-crimson/30 hover:bg-valor-crimson/10"
              onClick={clearLogs}
              disabled={logEntries.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full px-4 pb-4">
          {logEntries.length === 0 ? (
            <div className="h-full flex items-center justify-center text-text-tertiary py-20">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>No log entries yet</p>
                <p className="text-xs mt-1">Actions will be logged here</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              {logEntries.map((log, index) => (
                <div 
                  key={index} 
                  className="bg-midnight-elevated p-3 rounded-md border border-divider/30"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-sora font-medium text-arcane-60">{log.action}</span>
                    <span className="text-xs text-text-tertiary flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">{log.details}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LoggingPanel;
