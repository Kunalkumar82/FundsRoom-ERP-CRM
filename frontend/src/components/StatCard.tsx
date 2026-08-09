import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  iconColor?: string;
  accentGradient?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor = 'var(--primary)',
  accentGradient
}) => {
  return (
    <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
      {accentGradient && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: accentGradient
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem', fontWeight: 500 }}>
            {title}
          </p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            {value}
          </h3>
          {subtext && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              {subtext}
            </p>
          )}
        </div>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <Icon size={22} color={iconColor} />
        </div>
      </div>
    </div>
  );
};
