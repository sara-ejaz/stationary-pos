import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const SessionExpiredPage = () => {
  const navigate = useNavigate();
  const { recoverSession } = useAuth();

  const handleReLogin = () => {
    recoverSession();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6 md:p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center mx-auto">
          <Clock className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900">Session Inactivity Timeout</h2>
          <p className="text-xs text-slate-500">
            Your cashier session has expired due to store inactivity timeout policy. Please sign in again.
          </p>
        </div>
        <Button variant="primary" size="md" className="w-full" icon={<ArrowRight className="w-4 h-4" />} onClick={handleReLogin}>
          Return to Staff Login
        </Button>
      </div>
    </div>
  );
};
