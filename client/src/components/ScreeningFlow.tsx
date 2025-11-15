import React, { useState } from 'react';

export default function ScreeningFlow({ onComplete, userData, userId }) {
  const [loading, setLoading] = useState(false);
  
  const handleComplete = () => {
    setLoading(true);
    const data = {
      completed: true,
      location: userData?.trainingLocation || 'home',
      timestamp: new Date().toISOString()
    };
    if (onComplete) onComplete(data);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Screening Biomeccanico</h1>
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="mb-4">User: {userId || 'Test User'}</p>
          <p className="mb-4">Location: {userData?.trainingLocation || 'home'}</p>
          <button 
            onClick={handleComplete}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Caricamento...' : 'Completa Screening'}
          </button>
        </div>
      </div>
    </div>
  );
}
