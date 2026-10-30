import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6 md:p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500">
            Your current assigned role ({role || 'Guest'}) does not have permission to access this module.
          </p>
        </div>

        <div className="flex gap-2 justify-center pt-2">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/')}>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
