import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ScreeningFlow from '../components/ScreeningFlow';

export default function Screening() {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      let currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        currentUserId = 'test-' + Date.now();
        localStorage.setItem('userId', currentUserId);
      }
      setUserId(currentUserId);
      const localData = localStorage.getItem('onboardingData');
      if (localData) {
        setUserData(JSON.parse(localData));
      }
      setLoading(false);
    } catch (error) {
      console.error('[SCREENING] Error:', error);
      setLoading(false);
    }
  };

  const handleComplete = async (screeningData) => {
    console.log('[SCREENING] ✅ Assessment completed, navigating to dashboard');
    console.log('[SCREENING] Data:', screeningData);

    // I dati sono già salvati da ScreeningFlow in 'screening_data'
    // Naviga direttamente alla dashboard
    navigate('/dashboard');
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <ScreeningFlow 
      onComplete={handleComplete}
      userData={userData}
      userId={userId}
    />
  );
}
