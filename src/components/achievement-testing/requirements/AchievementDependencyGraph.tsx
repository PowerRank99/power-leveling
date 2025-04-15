import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Achievement } from '@/types/achievementTypes';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { ArrowUpRight, GitMerge, Activity, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AchievementNode {
  id: string;
  name: string;
  rank: string;
  unlocked: boolean;
  dependencies: string[];
  dependents: string[];
}

interface AchievementDependencyGraphProps {
  selectedAchievementId: string | null;
}

const AchievementDependencyGraph: React.FC<AchievementDependencyGraphProps> = ({
  selectedAchievementId
}) => {
  const { allAchievements, userAchievements } = useTestingDashboard();
  const [nodes, setNodes] = useState<AchievementNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [graphBuilt, setGraphBuilt] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (allAchievements.length === 0) return;
    
    setLoading(true);
    
    const buildGraph = () => {
      const dependencyMap: Record<string, string[]> = {};
      const dependentMap: Record<string, string[]> = {};
      
      allAchievements.forEach(ach => {
        dependencyMap[ach.id] = [];
        dependentMap[ach.id] = [];
      });
      
      allAchievements.forEach(ach => {
        if (ach.requirements && ach.requirements.type === 'ACHIEVEMENT') {
          const dependsOn = (ach.requirements as any).achievementId;
          if (dependsOn) {
            dependencyMap[ach.id].push(dependsOn);
            dependentMap[dependsOn].push(ach.id);
          }
        }
      });
      
      const graphNodes = allAchievements.map(ach => ({
        id: ach.id,
        name: ach.name,
        rank: ach.rank,
        unlocked: userAchievements[ach.id]?.isUnlocked || false,
        dependencies: dependencyMap[ach.id] || [],
        dependents: dependentMap[ach.id] || []
      }));
      
      setNodes(graphNodes);
      setLoading(false);
      setGraphBuilt(true);
    };
    
    buildGraph();
  }, [allAchievements, userAchievements]);
  
  useEffect(() => {
    if (!graphBuilt || !canvasRef.current || !nodes.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const nodePositions: Record<string, {x: number, y: number}> = {};
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.4;
    
    if (selectedAchievementId) {
      const selectedNode = nodes.find(n => n.id === selectedAchievementId);
      if (selectedNode) {
        nodePositions[selectedNode.id] = { x: centerX, y: centerY };
        
        const deps = selectedNode.dependencies;
        if (deps.length > 0) {
          const depAngleStep = Math.PI / (deps.length + 1);
          deps.forEach((depId, i) => {
            const angle = Math.PI + depAngleStep * (i + 1);
            nodePositions[depId] = {
              x: centerX + radius * Math.cos(angle),
              y: centerY + radius * Math.sin(angle) * 0.7
            };
          });
        }
        
        const dependents = selectedNode.dependents;
        if (dependents.length > 0) {
          const depAngleStep = Math.PI / (dependents.length + 1);
          dependents.forEach((depId, i) => {
            const angle = depAngleStep * (i + 1);
            nodePositions[depId] = {
              x: centerX + radius * Math.cos(angle),
              y: centerY + radius * Math.sin(angle) * 0.7
            };
          });
        }
      }
    } else {
      nodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / nodes.length;
        nodePositions[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
      });
    }
    
    ctx.lineWidth = 1.5;
    nodes.forEach(node => {
      const nodePos = nodePositions[node.id];
      if (!nodePos) return;
      
      node.dependencies.forEach(depId => {
        const depPos = nodePositions[depId];
        if (!depPos) return;
        
        ctx.beginPath();
        ctx.moveTo(depPos.x, depPos.y);
        ctx.lineTo(nodePos.x, nodePos.y);
        
        const depNode = nodes.find(n => n.id === depId);
        const isUnlocked = depNode?.unlocked || false;
        
        ctx.strokeStyle = isUnlocked 
          ? 'rgba(124, 58, 237, 0.6)'
          : 'rgba(255, 255, 255, 0.2)';
        
        ctx.stroke();
        
        const angle = Math.atan2(nodePos.y - depPos.y, nodePos.x - depPos.x);
        const size = 8;
        
        ctx.beginPath();
        ctx.moveTo(
          nodePos.x - size * Math.cos(angle),
          nodePos.y - size * Math.sin(angle)
        );
        ctx.lineTo(
          nodePos.x - size * Math.cos(angle) + size * Math.cos(angle - Math.PI/6),
          nodePos.y - size * Math.sin(angle) + size * Math.sin(angle - Math.PI/6)
        );
        ctx.lineTo(
          nodePos.x - size * Math.cos(angle) + size * Math.cos(angle + Math.PI/6),
          nodePos.y - size * Math.sin(angle) + size * Math.sin(angle + Math.PI/6)
        );
        ctx.closePath();
        ctx.fillStyle = isUnlocked 
          ? 'rgba(124, 58, 237, 0.6)'
          : 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
      });
    });
    
    nodes.forEach(node => {
      const pos = nodePositions[node.id];
      if (!pos) return;
      
      const isSelected = node.id === selectedAchievementId;
      const nodeSize = isSelected ? 24 : 20;
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeSize, 0, 2 * Math.PI);
      
      if (node.unlocked) {
        ctx.fillStyle = isSelected 
          ? 'rgba(124, 58, 237, 0.9)'
          : 'rgba(124, 58, 237, 0.6)';
      } else {
        ctx.fillStyle = isSelected 
          ? 'rgba(30, 30, 60, 0.9)'
          : 'rgba(20, 20, 40, 0.6)';
      }
      
      ctx.fill();
      
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.strokeStyle = isSelected 
        ? 'rgba(250, 204, 21, 0.85)'
        : node.unlocked 
          ? 'rgba(124, 58, 237, 0.9)'
          : 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();
      
      ctx.font = `${rankSize}px Space Grotesk`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(node.rank, pos.x, pos.y);
      
      ctx.font = '12px Sora';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isSelected 
        ? 'rgba(255, 255, 255, 0.95)'
        : 'rgba(255, 255, 255, 0.7)';
      
      let name = node.name;
      if (name.length > 15) {
        name = name.substring(0, 13) + '...';
      }
      
      ctx.fillText(name, pos.x, pos.y + nodeSize + 5);
    });
  }, [graphBuilt, nodes, selectedAchievementId, canvasRef]);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <GitMerge className="mr-2 h-5 w-5 text-arcane" />
          Achievement Dependencies
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[300px] w-full bg-midnight-elevated" />
          </div>
        ) : nodes.length > 0 ? (
          <div className="space-y-4">
            <div className="h-[300px] w-full relative border border-divider/30 rounded-md bg-midnight-card">
              <canvas 
                ref={canvasRef}
                className="w-full h-full"
              />
            </div>
            
            <div className="flex justify-between items-center text-sm text-text-secondary">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-arcane-60 mr-2"></div>
                <span>Unlocked</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-midnight-elevated border border-divider/30 mr-2"></div>
                <span>Locked</span>
              </div>
              <div className="flex items-center">
                <ArrowUpRight className="w-3 h-3 text-arcane-60 mr-2" />
                <span>Dependency</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-text-secondary">
            <Activity className="h-12 w-12 mb-4 text-text-tertiary" />
            <p>No dependency data available</p>
            <p className="text-xs mt-2">Select an achievement to visualize its dependencies</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementDependencyGraph;
