import React from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  Droplets, 
  Zap, 
  Car, 
  Construction, 
  HelpCircle 
} from 'lucide-react';

const iconMap = {
  pothole: AlertTriangle,
  garbage_dumping: Trash2,
  water_leakage: Droplets,
  street_light_failure: Zap,
  road_damage: Car,
  drainage_problem: Construction,
  other: HelpCircle,
};

const CategoryIcon = ({ category, className = "w-5 h-5" }) => {
  const Icon = iconMap[category] || iconMap.other;
  return <Icon className={className} />;
};

export default CategoryIcon;
