import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, switchRole } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a2224] border border-[#143d41] rounded-2xl p-6 md:p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-[#f2fbfa]">Access Restricted</h2>
          <p className="text-xs text-[#8da5a7]">
            Your current assigned role ({role}) does not have permission to access this module.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[#07181a] border border-[#143d41] text-xs text-[#8da5a7]">
          <span>Need access for testing? </span>
          <button
            onClick={() => switchRole('Admin')}
            className="text-[#007f87] hover:underline font-semibold"
          >
            Switch to Admin Role
          </button>
        </div>

        <div className="flex gap-2 justify-center">
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
