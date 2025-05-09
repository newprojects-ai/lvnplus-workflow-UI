import React from 'react';
import { Activity, User } from '../../types';
import Card from '../ui/Card';
import { Clock } from 'lucide-react';

interface ActivityListProps {
  activities: Activity[];
  users: User[];
  limit?: number;
}

const ActivityList: React.FC<ActivityListProps> = ({ 
  activities, 
  users,
  limit = 5
}) => {
  // Sort activities by timestamp (newest first) and limit
  const sortedActivities = [...activities]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);

  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  const getActivityIcon = (type: string): JSX.Element => {
    // You could use different icons for different activity types
    return <Clock className="h-4 w-4" />;
  };

  return (
    <Card title="Recent Activity" className="h-full">
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {sortedActivities.length === 0 ? (
          <div className="text-center text-gray-500 py-6">No recent activity</div>
        ) : (
          sortedActivities.map(activity => {
            const user = getUserById(activity.user);
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                {user && (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.details.action} {' '}
                    <span className="font-medium">{activity.details.entityName}</span>
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default ActivityList;