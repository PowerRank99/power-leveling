
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, GitBranch } from 'lucide-react';
import { Achievement } from '@/types/achievementTypes';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';

interface AchievementDependencyGraphProps {
  achievements: Achievement[];
  selectedAchievementId?: string;
  onSelectAchievement?: (achievementId: string) => void;
}

const AchievementDependencyGraph: React.FC<AchievementDependencyGraphProps> = ({
  achievements,
  selectedAchievementId,
  onSelectAchievement
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { userAchievements } = useTestingDashboard();

  useEffect(() => {
    // This is a placeholder for where we would implement actual graph visualization
    // In a real implementation, we would use a library like D3.js or react-flow to render the graph
    
    // For now, we'll just do some basic SVG drawing to illustrate the concept
    if (!svgRef.current || achievements.length === 0) return;
    
    const svg = svgRef.current;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    
    // Clear existing content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    
    // Simple visualization that shows achievements by rank
    const rankMap: Record<string, Achievement[]> = {};
    achievements.forEach(achievement => {
      if (!rankMap[achievement.rank]) rankMap[achievement.rank] = [];
      rankMap[achievement.rank].push(achievement);
    });
    
    const ranks = Object.keys(rankMap).sort();
    const levelHeight = height / (ranks.length || 1);
    
    ranks.forEach((rank, rankIndex) => {
      const achievementsInRank = rankMap[rank];
      const nodeWidth = width / (achievementsInRank.length || 1);
      
      // Create rank label
      const rankLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
      rankLabel.textContent = `Rank ${rank}`;
      rankLabel.setAttribute("x", "10");
      rankLabel.setAttribute("y", `${rankIndex * levelHeight + 20}`);
      rankLabel.setAttribute("fill", "#ffffff");
      rankLabel.setAttribute("font-size", "14px");
      svg.appendChild(rankLabel);
      
      // Create nodes for achievements
      achievementsInRank.forEach((achievement, index) => {
        const isSelected = achievement.id === selectedAchievementId;
        const isUnlocked = userAchievements[achievement.id]?.isUnlocked;
        
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", `${(index + 0.5) * nodeWidth}`);
        circle.setAttribute("cy", `${rankIndex * levelHeight + 60}`);
        circle.setAttribute("r", isSelected ? "15" : "10");
        
        if (isUnlocked) {
          circle.setAttribute("fill", "rgba(124, 58, 237, 0.9)"); // Arcane purple for unlocked
        } else {
          circle.setAttribute("fill", "rgba(255, 255, 255, 0.2)"); // Dim for locked
        }
        
        if (isSelected) {
          circle.setAttribute("stroke", "rgba(255, 255, 255, 0.9)");
          circle.setAttribute("stroke-width", "2");
        }
        
        circle.setAttribute("data-id", achievement.id);
        circle.addEventListener("click", () => {
          if (onSelectAchievement) onSelectAchievement(achievement.id);
        });
        circle.style.cursor = "pointer";
        svg.appendChild(circle);
        
        // Create labels for achievements
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.textContent = achievement.name.length > 15 ? achievement.name.substring(0, 15) + "..." : achievement.name;
        label.setAttribute("x", `${(index + 0.5) * nodeWidth}`);
        label.setAttribute("y", `${rankIndex * levelHeight + 85}`);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("fill", "#ffffff");
        label.setAttribute("font-size", "10px");
        svg.appendChild(label);
        
        // If this is the selected achievement, add dependency lines
        if (isSelected) {
          // This is a placeholder for where we would map actual dependencies
          // In a real implementation, we would calculate dependencies based on requirements
          
          const previousRankIndex = ranks.indexOf(rank) - 1;
          if (previousRankIndex >= 0) {
            const previousRank = ranks[previousRankIndex];
            const randomPrevAchievement = rankMap[previousRank][
              Math.floor(Math.random() * rankMap[previousRank].length)
            ];
            
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", `${(index + 0.5) * nodeWidth}`);
            line.setAttribute("y1", `${rankIndex * levelHeight + 45}`);
            line.setAttribute("x2", `${width / 2}`);
            line.setAttribute("y2", `${previousRankIndex * levelHeight + 75}`);
            line.setAttribute("stroke", "rgba(255, 255, 255, 0.3)");
            line.setAttribute("stroke-width", "1.5");
            line.setAttribute("stroke-dasharray", "5,5");
            svg.appendChild(line);
          }
        }
      });
    });
    
  }, [achievements, selectedAchievementId, userAchievements, onSelectAchievement]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-orbitron flex items-center">
          <GitBranch className="mr-2 h-4 w-4 text-arcane" />
          Achievement Dependencies
        </CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length > 0 ? (
          <div className="h-[400px] relative">
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              style={{ overflow: "visible" }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-text-tertiary">
              <span className="flex items-center">
                <Award className="h-3 w-3 mr-1" />
                Click on nodes to analyze dependencies
              </span>
            </div>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-text-tertiary">
            <p>No achievements available to visualize</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementDependencyGraph;
