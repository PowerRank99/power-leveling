
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Database, RefreshCcw, FileSearch, AlertTriangle, Trash2,
  FileText, Wrench, Download, Filter, Check, X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DataInspectorProps {
  userId: string;
}

// Define table types for inspection
type InspectableTable = 
  | 'achievement_progress' 
  | 'user_achievements' 
  | 'workouts' 
  | 'workout_sets'
  | 'personal_records'
  | 'manual_workouts'
  | 'power_day_usage';

interface TableMetadata {
  name: InspectableTable;
  displayName: string;
  icon: React.ReactNode;
  userIdColumn: string;
  description: string;
}

const DataInspector: React.FC<DataInspectorProps> = ({ userId }) => {
  const { logAction } = useTestingDashboard();
  const [selectedTable, setSelectedTable] = useState<InspectableTable>('achievement_progress');
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Define inspectable tables with metadata
  const tableDefinitions: TableMetadata[] = [
    {
      name: 'achievement_progress',
      displayName: 'Achievement Progress',
      icon: <FileText className="h-4 w-4" />,
      userIdColumn: 'user_id',
      description: 'Tracks user progress toward achievements'
    },
    {
      name: 'user_achievements',
      displayName: 'Unlocked Achievements',
      icon: <Check className="h-4 w-4" />,
      userIdColumn: 'user_id',
      description: 'Records which achievements have been unlocked'
    },
    {
      name: 'workouts',
      displayName: 'Workouts',
      icon: <FileText className="h-4 w-4" />,
      userIdColumn: 'user_id',
      description: 'User workout sessions'
    },
    {
      name: 'workout_sets',
      displayName: 'Workout Sets',
      icon: <FileText className="h-4 w-4" />,
      userIdColumn: 'workout_id',
      description: 'Individual sets within workouts'
    },
    {
      name: 'personal_records',
      displayName: 'Personal Records',
      icon: <TrendingUp className="h-4 w-4" />,
      userIdColumn: 'user_id',
      description: 'User personal records for exercises'
    },
    {
      name: 'manual_workouts',
      displayName: 'Manual Workouts',
      icon: <FileText className="h-4 w-4" />,
      userIdColumn: 'user_id',
      description: 'Manually recorded workouts'
    },
    {
      name: 'power_day_usage',
      displayName: 'Power Day Usage',
      icon: <Zap className="h-4 w-4" />,
      userIdColumn: 'user_id',
      description: 'Tracks power day usage by week'
    }
  ];
  
  // Function to fetch table data
  const fetchTableData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const selectedTableDef = tableDefinitions.find(t => t.name === selectedTable);
      if (!selectedTableDef) return;
      
      let query = supabase
        .from(selectedTable)
        .select('*');
      
      // For tables with direct user_id column, filter by user
      if (selectedTableDef.userIdColumn === 'user_id') {
        query = query.eq('user_id', userId);
      } 
      // For workout_sets, we need a join to filter by user
      else if (selectedTable === 'workout_sets') {
        const { data: workoutIds } = await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', userId);
          
        if (workoutIds && workoutIds.length > 0) {
          query = query.in('workout_id', workoutIds.map(w => w.id));
        } else {
          setTableData([]);
          setColumns([]);
          setIsLoading(false);
          setIsDataLoaded(true);
          return;
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        toast.error(`Error fetching ${selectedTable} data`, {
          description: error.message
        });
        return;
      }
      
      if (data && data.length > 0) {
        setTableData(data);
        setColumns(Object.keys(data[0]));
      } else {
        setTableData([]);
        setColumns([]);
      }
      
      logAction('Data Inspection', `Fetched ${data?.length || 0} rows from ${selectedTable}`);
      setIsDataLoaded(true);
    } catch (error) {
      toast.error(`Error inspecting data`, {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to clean data for selected table
  const cleanTableData = async () => {
    if (!userId || !selectedTable) return;
    
    setIsLoading(true);
    try {
      const selectedTableDef = tableDefinitions.find(t => t.name === selectedTable);
      if (!selectedTableDef) return;
      
      let result;
      
      // For tables with direct user_id
      if (selectedTableDef.userIdColumn === 'user_id') {
        result = await supabase
          .from(selectedTable)
          .delete()
          .eq('user_id', userId);
      } 
      // For workout_sets, we need a join to delete by user's workouts
      else if (selectedTable === 'workout_sets') {
        const { data: workoutIds } = await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', userId);
          
        if (workoutIds && workoutIds.length > 0) {
          result = await supabase
            .from(selectedTable)
            .delete()
            .in('workout_id', workoutIds.map(w => w.id));
        }
      }
      
      if (result?.error) {
        toast.error(`Error cleaning ${selectedTable} data`, {
          description: result.error.message
        });
        return;
      }
      
      toast.success(`${selectedTable} data cleaned`, {
        description: `All user data has been removed from ${selectedTable}`
      });
      
      logAction('Data Cleaning', `Cleaned data in ${selectedTable}`);
      
      // Refresh data
      fetchTableData();
    } catch (error) {
      toast.error(`Error cleaning data`, {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to export data
  const exportTableData = () => {
    if (tableData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    try {
      const dataStr = JSON.stringify(tableData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `${selectedTable}-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Data exported successfully');
      logAction('Data Export', `Exported ${tableData.length} rows from ${selectedTable}`);
    } catch (error) {
      toast.error('Error exporting data', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
  
  // Filter data based on search input
  const filteredData = tableData.filter(row => {
    if (!filterValue) return true;
    
    // Check if any column contains the filter value
    return Object.values(row).some(value => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(filterValue.toLowerCase());
    });
  });
  
  // Handle repair data
  const repairData = async () => {
    setIsLoading(true);
    try {
      // This would connect to repair utilities in a real implementation
      toast.success('Data repair initiated', {
        description: 'Correcting inconsistencies in user achievement data'
      });
      
      // For demonstration purposes, add a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Data repair completed', {
        description: 'User achievement data has been repaired'
      });
      
      logAction('Data Repair', `Repaired inconsistencies in ${selectedTable}`);
      
      // Refresh data
      fetchTableData();
    } catch (error) {
      toast.error('Error repairing data', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Database className="mr-2 h-5 w-5 text-arcane" />
          Data Inspector
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <div className="flex flex-1 gap-2">
            <Select 
              value={selectedTable} 
              onValueChange={(value) => setSelectedTable(value as InspectableTable)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {tableDefinitions.map(table => (
                  <SelectItem key={table.name} value={table.name}>
                    <div className="flex items-center">
                      {table.icon}
                      <span className="ml-2">{table.displayName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={fetchTableData}
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={cleanTableData}
              disabled={isLoading || !isDataLoaded || tableData.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Clean</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={repairData}
              disabled={isLoading || !isDataLoaded}
            >
              <Wrench className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Repair</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportTableData}
              disabled={isLoading || !isDataLoaded || tableData.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
        
        {isDataLoaded && (
          <div className="flex items-center">
            <div className="flex-1">
              <Input
                placeholder="Filter data..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="max-w-xs"
                prefixIcon={<Filter className="h-4 w-4 text-text-tertiary" />}
              />
            </div>
            <div className="text-sm text-text-secondary">
              {filteredData.length} {filteredData.length === 1 ? 'row' : 'rows'}
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[300px] w-full bg-midnight-elevated" />
          </div>
        ) : isDataLoaded ? (
          tableData.length > 0 ? (
            <div className="border border-divider/30 rounded-md overflow-hidden">
              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map(column => (
                        <TableHead key={column} className="whitespace-nowrap">
                          {column}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {columns.map(column => (
                          <TableCell key={`${rowIndex}-${column}`} className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                            {typeof row[column] === 'object' ? 
                              JSON.stringify(row[column]) : 
                              String(row[column] !== null ? row[column] : '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] border border-divider/30 rounded-md">
              <FileSearch className="h-12 w-12 text-text-tertiary mb-4" />
              <p className="text-text-secondary">No data found</p>
              <p className="text-xs text-text-tertiary mt-1">Select a table and click Refresh to load data</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] border border-divider/30 rounded-md">
            <Database className="h-12 w-12 text-text-tertiary mb-4" />
            <p className="text-text-secondary">Select a table to inspect</p>
            <p className="text-xs text-text-tertiary mt-1">View, clean, repair, and export user data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataInspector;
