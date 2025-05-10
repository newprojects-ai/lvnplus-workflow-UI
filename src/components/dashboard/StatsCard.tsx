import React from 'react';
import Card from '../ui/Card';
import { useRBAC } from '../../hooks/useRBAC';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'red';
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  },
  permission?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  change,
  permission
}) => {
  const { hasPermission } = useRBAC();

  if (permission && !hasPermission(permission)) {
    return null;
  }

  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  };

  const changeColors = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
  };

  return (
    <Card className="h-full">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change && (
              <p className={`ml-2 text-sm ${changeColors[change.type]}`}>
                {change.type === 'increase' ? '↑' : '↓'} {Math.abs(change.value)}%
              </p>
            )}
          </div>
        </div>
        <div className={`rounded-full p-3 ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;