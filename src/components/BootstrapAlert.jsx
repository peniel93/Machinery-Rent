import React from 'react';
import { useAlert } from '../context/AlertContext';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const BootstrapAlert = () => {
  const { alerts, removeAlert } = useAlert();

  if (alerts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} className="flex-shrink-0" />;
      case 'danger': return <XCircle size={20} className="flex-shrink-0" />;
      case 'warning': return <AlertTriangle size={20} className="flex-shrink-0" />;
      default: return <Info size={20} className="flex-shrink-0" />;
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '420px',
        width: 'calc(100% - 3rem)'
      }}
    >
      {alerts.map(alert => (
        <div key={alert.id} className={`alert alert-${alert.type}`}>
          {getIcon(alert.type)}
          <span style={{ fontSize: '0.925rem', fontWeight: 500 }}>{alert.message}</span>
          <button 
            type="button" 
            className="alert-close-btn" 
            onClick={() => removeAlert(alert.id)}
            title="Close Alert"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
