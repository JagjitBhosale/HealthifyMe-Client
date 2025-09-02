import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Dashboard from './components/Dashboard.jsx';
import InitialSetup from './components/InitialSetup.jsx';

// Main App Component
export default function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('App component mounted, loading user profile...');
    const savedProfile = localStorage.getItem('userProfile');
    console.log('Saved profile from localStorage:', savedProfile);
    
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        console.log('Successfully parsed user profile:', parsedProfile);
        setUserProfile(parsedProfile);
      } catch (error) {
        console.error('Error parsing user profile:', error);
        setUserProfile(null);
      }
    } else {
      console.log('No user profile found in localStorage');
      setUserProfile(null);
    }
    setIsLoading(false);
  }, []);

  const handleSetupComplete = (profile) => {
    setUserProfile(profile);
  };

  const handleLogout = () => {
    console.log('Logout called - clearing localStorage');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('dailyData');
    setUserProfile(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  return userProfile ? (
    <Dashboard profile={userProfile} onLogout={handleLogout} />
  ) : (
    <InitialSetup onComplete={handleSetupComplete} />
  );
}