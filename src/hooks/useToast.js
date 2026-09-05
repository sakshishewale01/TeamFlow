import { useContext } from 'react';
import { ToastContext } from '../context/toastContextDef';

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};

export default useToast;
