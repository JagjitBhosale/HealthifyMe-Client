import React, { useState } from 'react';
import { calculateDailyCalories } from '../utils/calculations.js';

// Initial Setup Component
const InitialSetup = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    activityLevel: 'moderate',
    goal: 'maintain'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        // Use Gemini AI for BMR calculation
        const response = await fetch('http://localhost:5000/api/calculate-bmr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });
        
        const aiCalculations = await response.json();
        const completeProfile = { ...profile, ...aiCalculations };
        localStorage.setItem('userProfile', JSON.stringify(completeProfile));
        onComplete(completeProfile);
      } catch (error) {
        console.error('Error calculating BMR with AI:', error);
        // Fallback to local calculation
        const calories = calculateDailyCalories(profile);
        const completeProfile = { ...profile, ...calories };
        localStorage.setItem('userProfile', JSON.stringify(completeProfile));
        onComplete(completeProfile);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {step === 1 && "Let's Get Started"}
          {step === 2 && "Your Details"}
          {step === 3 && "Your Goals"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white placeholder-white/70 border border-white/30 focus:outline-none focus:border-white/50"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Age"
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white placeholder-white/70 border border-white/30 focus:outline-none focus:border-white/50"
                value={profile.age}
                onChange={(e) => setProfile({...profile, age: e.target.value})}
                required
              />
              <div className="flex gap-4">
                <button
                  type="button"
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    profile.gender === 'male' 
                      ? 'bg-white text-purple-600' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  onClick={() => setProfile({...profile, gender: 'male'})}
                >
                  Male
                </button>
                <button
                  type="button"
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    profile.gender === 'female' 
                      ? 'bg-white text-purple-600' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  onClick={() => setProfile({...profile, gender: 'female'})}
                >
                  Female
                </button>
              </div>
            </>
          )}
          
          {step === 2 && (
            <>
              <input
                type="number"
                placeholder="Height (cm)"
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white placeholder-white/70 border border-white/30 focus:outline-none focus:border-white/50"
                value={profile.height}
                onChange={(e) => setProfile({...profile, height: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white placeholder-white/70 border border-white/30 focus:outline-none focus:border-white/50"
                value={profile.weight}
                onChange={(e) => setProfile({...profile, weight: e.target.value})}
                required
              />
              <select
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white border border-white/30 focus:outline-none focus:border-white/50"
                value={profile.activityLevel}
                onChange={(e) => setProfile({...profile, activityLevel: e.target.value})}
              >
                <option value="sedentary" className="text-gray-800">Sedentary (little or no exercise)</option>
                <option value="light" className="text-gray-800">Light (1-3 days/week)</option>
                <option value="moderate" className="text-gray-800">Moderate (3-5 days/week)</option>
                <option value="active" className="text-gray-800">Active (6-7 days/week)</option>
                <option value="veryActive" className="text-gray-800">Very Active (physical job)</option>
              </select>
            </>
          )}
          
          {step === 3 && (
            <div className="space-y-3">
              <button
                type="button"
                className={`w-full px-4 py-4 rounded-xl font-medium transition-all text-left ${
                  profile.goal === 'lose' 
                    ? 'bg-white text-purple-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                onClick={() => setProfile({...profile, goal: 'lose'})}
              >
                <div className="font-semibold">Lose Weight</div>
                <div className="text-sm opacity-80">Target: -0.5kg per week</div>
              </button>
              <button
                type="button"
                className={`w-full px-4 py-4 rounded-xl font-medium transition-all text-left ${
                  profile.goal === 'maintain' 
                    ? 'bg-white text-purple-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                onClick={() => setProfile({...profile, goal: 'maintain'})}
              >
                <div className="font-semibold">Maintain Weight</div>
                <div className="text-sm opacity-80">Keep current weight</div>
              </button>
              <button
                type="button"
                className={`w-full px-4 py-4 rounded-xl font-medium transition-all text-left ${
                  profile.goal === 'gain' 
                    ? 'bg-white text-purple-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                onClick={() => setProfile({...profile, goal: 'gain'})}
              >
                <div className="font-semibold">Gain Weight</div>
                <div className="text-sm opacity-80">Target: +0.5kg per week</div>
              </button>
            </div>
          )}
          
          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium hover:bg-white/30 transition-all"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-white rounded-xl text-purple-600 font-medium hover:bg-white/90 transition-all"
            >
              {step === 3 ? 'Complete Setup' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InitialSetup;