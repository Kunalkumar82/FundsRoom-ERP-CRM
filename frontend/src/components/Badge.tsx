import React from 'react';

interface BadgeProps {
  status: string;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getBadgeStyle = (val: string) => {
    switch (val) {
      case 'Confirmed':
      case 'Active':
      case 'IN':
        return 'badge-emerald';
      case 'Draft':
      case 'Lead':
        return 'badge-amber';
      case 'Cancelled':
      case 'Inactive':
      case 'OUT':
        return 'badge-rose';
      case 'Wholesale':
      case 'Distributor':
        return 'badge-purple';
      case 'Retail':
        return 'badge-cyan';
      default:
        return 'badge-slate';
    }
  };

  return (
    <span className={`badge ${getBadgeStyle(status)}`}>
      {status}
    </span>
  );
};
