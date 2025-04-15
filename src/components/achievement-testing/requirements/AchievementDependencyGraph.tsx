
import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { Achievement } from '@/types/achievementTypes';

interface DependencyNode {
  id: string;
  label: string;
  rank: string;
  isUnlocked: boolean;
  category: string;
}

interface DependencyLink {
  source: string;
  target: string;
  type: 'prerequisite' | 'suggested';
}

interface DependencyGraphData {
  nodes: DependencyNode[];
  links: DependencyLink[];
}

interface AchievementDependencyGraphProps {
  selectedAchievementId?: string;
}

const AchievementDependencyGraph: React.FC<AchievementDependencyGraphProps> = ({ 
  selectedAchievementId 
}) => {
  const { allAchievements, userAchievements } = useTestingDashboard();
  const [graphData, setGraphData] = useState<DependencyGraphData | null>(null);
  
  // Determine prerequisites based on rank and relationships
  const findPrerequisites = (achievement: Achievement): string[] => {
    // For this example, we'll use rank as a simple prerequisite system
    // In a real system, you'd have more complex logic or actual prerequisite data
    const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S'];
    const achievementRank = rankOrder.indexOf(achievement.rank);
    
    // Get achievements of the previous rank in the same category
    return allAchievements
      .filter(a => 
        a.category === achievement.category && 
        rankOrder.indexOf(a.rank) === achievementRank - 1
      )
      .map(a => a.id);
  };
  
  // Generate dependency graph data
  const generateGraphData = useMemo(() => {
    const nodes: DependencyNode[] = allAchievements.map(achievement => ({
      id: achievement.id,
      label: achievement.name,
      rank: achievement.rank,
      category: achievement.category,
      isUnlocked: userAchievements[achievement.id]?.isUnlocked || false
    }));
    
    const links: DependencyLink[] = [];
    
    // Create links based on prerequisites
    allAchievements.forEach(achievement => {
      const prerequisites = findPrerequisites(achievement);
      prerequisites.forEach(prereqId => {
        links.push({
          source: prereqId,
          target: achievement.id,
          type: 'prerequisite'
        });
      });
    });
    
    return { nodes, links };
  }, [allAchievements, userAchievements]);
  
  useEffect(() => {
    setGraphData(generateGraphData);
  }, [generateGraphData]);
  
  if (!graphData || graphData.nodes.length === 0) {
    return (
      <Card className="p-4">
        <CardContent className="flex flex-col items-center justify-center h-[300px] text-text-secondary">
          <p>No achievement dependency data available</p>
        </CardContent>
      </Card>
    );
  }
  
  // If a specific achievement is selected, filter the graph
  const filteredData = selectedAchievementId 
    ? {
        nodes: graphData.nodes.filter(node => 
          node.id === selectedAchievementId || 
          graphData.links.some(link => 
            (link.source === selectedAchievementId && link.target === node.id) ||
            (link.target === selectedAchievementId && link.source === node.id)
          )
        ),
        links: graphData.links.filter(link => 
          link.source === selectedAchievementId || 
          link.target === selectedAchievementId
        )
      }
    : graphData;
  
  return (
    <Card className="p-4">
      <CardContent className="h-[300px] overflow-auto">
        <h3 className="text-sm font-medium mb-3">Achievement Dependencies</h3>
        
        {filteredData.nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[250px] text-text-secondary">
            <p>No dependencies found for this achievement</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Simple visualization - in a real app, you might use a library like d3 or react-flow */}
            {filteredData.nodes.map(node => (
              <div 
                key={node.id}
                className={`p-3 rounded-md border ${
                  node.isUnlocked 
                    ? 'border-arcane bg-arcane-15' 
                    : node.id === selectedAchievementId
                      ? 'border-valor-30 bg-valor-15'
                      : 'border-divider/30'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{node.label}</span>
                  <div className="flex gap-1">
                    <Badge variant="outline">Rank {node.rank}</Badge>
                    {node.isUnlocked && (
                      <Badge variant="arcane">Unlocked</Badge>
                    )}
                    {node.id === selectedAchievementId && (
                      <Badge variant="valor">Selected</Badge>
                    )}
                  </div>
                </div>
                
                {/* Show connections */}
                {filteredData.links
                  .filter(link => link.source === node.id || link.target === node.id)
                  .map((link, idx) => {
                    const connectedId = link.source === node.id ? link.target : link.source;
                    const connectedNode = filteredData.nodes.find(n => n.id === connectedId);
                    const relationType = link.source === node.id ? 'Leads to' : 'Requires';
                    
                    return connectedNode ? (
                      <div key={idx} className="mt-2 text-sm pl-3 border-l-2 border-divider/30">
                        <span className="text-text-secondary">{relationType}: </span>
                        <span>{connectedNode.label}</span>
                      </div>
                    ) : null;
                  })
                }
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementDependencyGraph;
