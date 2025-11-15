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
    localStorage.setItem('screeningData', JSON.stringify(screeningData));
    if (userData?.trainingLocation === 'gym') {
      navigate('/assessment-gym');
    } else {
      navigate('/assessment-home');
    }
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
