
export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  level: string;
  type: string;
  image_url?: string;
  description?: string;
  equipment_type?: string;
  // Legacy fields - these will eventually be removed but kept for backward compatibility
  category?: string; 
  equipment?: string;
}
