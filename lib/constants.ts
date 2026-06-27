export const CATEGORIES = [
  'Pothole',
  'Garbage / Waste',
  'Water Leakage',
  'Streetlight Issue',
  'Road Damage',
  'Public Safety',
  'Illegal Dumping',
  'Broken Infrastructure',
  'Flooding',
  'Tree / Park Issue',
  'Other',
];

export const SEVERITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  low:      { label: 'Low',      color: 'bg-green-100 text-green-800',  dot: 'bg-green-500'  },
  medium:   { label: 'Medium',   color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  high:     { label: 'High',     color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800',      dot: 'bg-red-500'    },
};

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open:        { label: 'Open',        color: 'bg-blue-100 text-blue-800'   },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
  resolved:    { label: 'Resolved',    color: 'bg-green-100 text-green-800' },
  closed:      { label: 'Closed',      color: 'bg-gray-100 text-gray-800'   },
};

export const BADGE_LEVELS = {
  newcomer:  { label: 'Newcomer',        minPoints: 0,    icon: '🌱' },
  reporter:  { label: 'Reporter',         minPoints: 50,   icon: '📋' },
  guardian:  { label: 'Guardian',         minPoints: 200,  icon: '🛡️' },
  hero:      { label: 'Community Hero',   minPoints: 500,  icon: '⭐' },
  champion:  { label: 'Champion',         minPoints: 1000, icon: '🏆' },
};