import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'success' | 'pending' | 'error' | 'warning';
  label: string;
  size?: 'sm' | 'md';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  label, 
  size = 'md' 
}) => {
  const configs = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    },
    pending: {
      icon: Clock,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      iconColor: 'text-red-600'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-600'
    }
  };

  const config = configs[status];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1';

  return (
    <span className={`inline-flex items-center ${padding} rounded-full ${config.bgColor} ${config.textColor} ${textSize} font-medium`}>
      <Icon className={`${iconSize} ${config.iconColor} mr-1.5`} />
      {label}
    </span>
  );
};

export default StatusIndicator;