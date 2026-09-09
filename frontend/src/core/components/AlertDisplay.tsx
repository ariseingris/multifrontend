import React, { useEffect, useState } from 'react';
import { useAlertStore } from '../store';
import { getStatusColor } from '../utils/formatting';

export const AlertDisplay: React.FC = () => {
  const currentAlert = useAlertStore((s) => s.currentAlert);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (currentAlert) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        if (currentAlert.severity !== 'critical') {
          setIsVisible(false);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentAlert]);

  if (!isVisible || !currentAlert) return null;

  const color = getStatusColor(currentAlert.severity as any);
  const isActive = currentAlert.severity === 'critical';

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        maxWidth: '400px',
        background: '#1a1a1a',
        border: `2px solid ${color}`,
        borderRadius: '8px',
        padding: '16px',
        boxShadow: isActive
          ? `0 0 30px ${color}80, 0 10px 40px rgba(0,0,0,0.8)`
          : '0 10px 40px rgba(0,0,0,0.5)',
        zIndex: 1000,
        animation: isActive
          ? 'slideInShake 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'slideIn 0.3s ease-out',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            fontSize: currentAlert.severity === 'critical' ? '24px' : '20px',
            lineHeight: '1',
          }}
        >
          {currentAlert.severity === 'critical' && '🚨'}
          {currentAlert.severity === 'warning' && '⚠️'}
          {currentAlert.severity === 'info' && 'ℹ️'}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color,
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {currentAlert.type.replace(/_/g, ' ')}
          </div>

          <div
            style={{
              fontSize: '13px',
              color: '#d0d0d0',
              lineHeight: '1.4',
              marginBottom: '8px',
            }}
          >
            {currentAlert.message}
          </div>

          {currentAlert.metric && (
            <div
              style={{
                fontSize: '12px',
                color: '#9ca3af',
                background: 'rgba(0,0,0,0.3)',
                padding: '6px 8px',
                borderRadius: '3px',
                marginBottom: '8px',
              }}
            >
              <strong>{currentAlert.metric}:</strong> {currentAlert.value}
              {currentAlert.threshold && (
                <>
                  {' '}
                  (threshold: {currentAlert.threshold})
                </>
              )}
            </div>
          )}

          {isActive && (
            <div
              style={{
                fontSize: '11px',
                color: '#6b7280',
                fontStyle: 'italic',
              }}
            >
              ⚡ Immediate action required
            </div>
          )}
        </div>

        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0',
            lineHeight: '1',
          }}
        >
          ×
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(420px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInShake {
          0% {
            transform: translateX(420px) rotateZ(0deg);
            opacity: 0;
          }
          50% {
            transform: translateX(-5px) rotateZ(-1deg);
          }
          100% {
            transform: translateX(0) rotateZ(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
