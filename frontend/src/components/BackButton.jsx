import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ to }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className="inline-flex items-center gap-2 text-sm text-brand-blue hover:text-brand-dark"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );
};

export default BackButton;