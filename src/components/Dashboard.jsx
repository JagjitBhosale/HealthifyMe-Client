import React, { useState, useEffect, useRef } from 'react';
import { Camera, Send, TrendingUp, User, Target, Activity, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

// Main Dashboard Component
const Dashboard = ({ profile, onLogout }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyData, setDailyData] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log('Dashboard mounted, loading data from localStorage...');
    const savedData = localStorage.getItem('dailyData');
    console.log('Raw saved data from localStorage:', savedData);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('Successfully parsed daily data:', parsedData);
        setDailyData(parsedData);
      } catch (error) {
        console.error('Error parsing saved data:', error);
        console.error('Problematic data:', savedData);
        setDailyData({});
      }
    } else {
      console.log('No saved data found in localStorage');
      setDailyData({});
    }
  }, []);

  useEffect(() => {
    // Only save if dailyData is not empty (avoid saving empty object on initial load)
    if (Object.keys(dailyData).length > 0) {
      try {
        localStorage.setItem('dailyData', JSON.stringify(dailyData));
        console.log('Saved daily data to localStorage:', dailyData);
      } catch (error) {
        console.error('Error saving data to localStorage:', error);
      }
    } else {
      console.log('Skipping save - dailyData is empty');
    }
  }, [dailyData]);

  const currentDayData = dailyData[selectedDate] || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    items: []
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });
      
      const data = await response.json();
      
      if (!data.error) {
        const newItem = {
          name: data.foodItem,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          time: new Date().toLocaleTimeString(),
          type: 'text'
        };
        
        updateDailyData(newItem);
      }
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze food. Please try again.');
    }
    setIsLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('http://localhost:5000/api/analyze-image', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!data.error) {
        const newItem = {
          name: data.foodItem,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          time: new Date().toLocaleTimeString(),
          type: 'image'
        };
        
        updateDailyData(newItem);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze image. Please try again.');
    }
    setIsLoading(false);
    e.target.value = '';
  };

  const updateDailyData = (newItem) => {
    setDailyData(prev => {
      const currentData = prev[selectedDate] || { calories: 0, protein: 0, carbs: 0, fat: 0, items: [] };
      const updatedData = {
        ...prev,
        [selectedDate]: {
          calories: currentData.calories + newItem.calories,
          protein: currentData.protein + newItem.protein,
          carbs: currentData.carbs + newItem.carbs,
          fat: currentData.fat + newItem.fat,
          items: [...currentData.items, newItem]
        }
      };
      
      // Immediately save to localStorage
      try {
        localStorage.setItem('dailyData', JSON.stringify(updatedData));
        console.log('Immediately saved updated data:', updatedData);
      } catch (error) {
        console.error('Error immediately saving data:', error);
      }
      
      return updatedData;
    });
  };

  const removeItem = (index) => {
    setDailyData(prev => {
      const currentData = prev[selectedDate];
      if (!currentData) return prev;
      
      const itemToRemove = currentData.items[index];
      const updatedData = {
        ...prev,
        [selectedDate]: {
          calories: currentData.calories - itemToRemove.calories,
          protein: currentData.protein - itemToRemove.protein,
          carbs: currentData.carbs - itemToRemove.carbs,
          fat: currentData.fat - itemToRemove.fat,
          items: currentData.items.filter((_, i) => i !== index)
        }
      };
      
      // Immediately save to localStorage
      try {
        localStorage.setItem('dailyData', JSON.stringify(updatedData));
        console.log('Immediately saved after removal:', updatedData);
      } catch (error) {
        console.error('Error immediately saving after removal:', error);
      }
      
      return updatedData;
    });
  };

  const changeDate = (direction) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + direction);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateString === today.toISOString().split('T')[0]) return 'Today';
    if (dateString === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const exportData = () => {
    const dataToExport = {
      dailyData,
      userProfile: JSON.parse(localStorage.getItem('userProfile') || '{}'),
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `calories-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (importedData.dailyData) {
          setDailyData(importedData.dailyData);
          localStorage.setItem('dailyData', JSON.stringify(importedData.dailyData));
        }
        
        if (importedData.userProfile) {
          localStorage.setItem('userProfile', JSON.stringify(importedData.userProfile));
        }
        
        alert('Data imported successfully!');
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const debugLocalStorage = () => {
    const savedData = localStorage.getItem('dailyData');
    const userProfile = localStorage.getItem('userProfile');
    console.log('=== DEBUG LOCALSTORAGE ===');
    console.log('dailyData from localStorage:', savedData);
    console.log('userProfile from localStorage:', userProfile);
    console.log('current dailyData state:', dailyData);
    console.log('current selectedDate:', selectedDate);
    console.log('currentDayData:', currentDayData);
    console.log('========================');
    alert(`Check console for debug info. Current items: ${currentDayData.items.length}`);
  };

  const addTestData = () => {
    const testItem = {
      name: 'Test Food Item',
      calories: 250,
      protein: 15,
      carbs: 30,
      fat: 8,
      time: new Date().toLocaleTimeString(),
      type: 'test'
    };
    
    console.log('Adding test data:', testItem);
    updateDailyData(testItem);
    alert('Test data added! Check if it persists after refresh.');
  };

  const caloriePercentage = Math.min((currentDayData.calories / profile.target) * 100, 100);
  const remainingCalories = profile.target - currentDayData.calories;

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
        <div className="absolute top-1/3 right-10 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-semibold">{profile.name}</h1>
                  <p className="text-white/70 text-sm">BMR: {profile.bmr} cal</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={addTestData}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all"
                  title="Add Test Data"
                >
                  🧪
                </button>
                <button
                  onClick={debugLocalStorage}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all"
                  title="Debug Data"
                >
                  🐛
                </button>
                <button
                  onClick={exportData}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all"
                  title="Export Data"
                >
                  📥
                </button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                  id="import-data"
                />
                <button
                  onClick={() => document.getElementById('import-data').click()}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all"
                  title="Import Data"
                >
                  📤
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all"
                >
                  <TrendingUp className="w-5 h-5" />
                </button>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <div className="text-center">
                <div className="text-white font-semibold text-lg">{formatDate(selectedDate)}</div>
                <div className="text-white/70 text-sm">{selectedDate}</div>
              </div>
              <button
                onClick={() => changeDate(1)}
                disabled={selectedDate === new Date().toISOString().split('T')[0]}
                className="p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Calorie Overview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-lg">Calories</h2>
                <Target className="w-5 h-5 text-white/70" />
              </div>
              
              <div className="relative h-48 flex items-center justify-center">
                <svg className="absolute w-40 h-40">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="white"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${caloriePercentage * 4.4} 440`}
                    strokeLinecap="round"
                    transform="rotate(-90 80 80)"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                </svg>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{currentDayData.calories}</div>
                  <div className="text-white/70 text-sm">of {profile.target}</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white/10 rounded-xl">
                <div className="text-white/70 text-sm mb-1">Remaining</div>
                <div className={`text-2xl font-bold ${remainingCalories < 0 ? 'text-red-300' : 'text-white'}`}>
                  {remainingCalories > 0 ? remainingCalories : `+${Math.abs(remainingCalories)}`} cal
                </div>
              </div>
            </div>

            {/* Macros */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-lg">Macros</h2>
                <Activity className="w-5 h-5 text-white/70" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/70">Protein</span>
                    <span className="text-white font-medium">{currentDayData.protein}g / {profile.protein}g</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.min((currentDayData.protein / profile.protein) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/70">Carbs</span>
                    <span className="text-white font-medium">{currentDayData.carbs}g / {profile.carbs}g</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all"
                      style={{ width: `${Math.min((currentDayData.carbs / profile.carbs) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white/70">Fat</span>
                    <span className="text-white font-medium">{currentDayData.fat}g / {profile.fat}g</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all"
                      style={{ width: `${Math.min((currentDayData.fat / profile.fat) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-2">
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-white/70 text-xs">Protein</div>
                  <div className="text-white font-semibold">{Math.round((currentDayData.protein * 4 / Math.max(currentDayData.calories, 1)) * 100)}%</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-white/70 text-xs">Carbs</div>
                  <div className="text-white font-semibold">{Math.round((currentDayData.carbs * 4 / Math.max(currentDayData.calories, 1)) * 100)}%</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="text-white/70 text-xs">Fat</div>
                  <div className="text-white font-semibold">{Math.round((currentDayData.fat * 9 / Math.max(currentDayData.calories, 1)) * 100)}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Food Items */}
          {currentDayData.items.length > 0 && (
            <div className="mt-4 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-white font-semibold text-lg mb-4">Today's Food</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentDayData.items.map((item, index) => (
                  <div key={index} className="bg-white/10 rounded-xl p-3 flex items-center justify-between group hover:bg-white/20 transition-all">
                    <div className="flex-1">
                      <div className="text-white font-medium">{item.name}</div>
                      <div className="text-white/70 text-sm">{item.time} • {item.calories} cal</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-white/70 text-xs">P: {item.protein}g</div>
                        <div className="text-white/70 text-xs">C: {item.carbs}g</div>
                        <div className="text-white/70 text-xs">F: {item.fat}g</div>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="p-1 hover:bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History View */}
          {showHistory && (
            <div className="mt-4 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-white font-semibold text-lg mb-4">Weekly Overview</h2>
              <div className="space-y-2">
                {[...Array(7)].map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - i);
                  const dateString = date.toISOString().split('T')[0];
                  const dayData = dailyData[dateString] || { calories: 0 };
                  const percentage = (dayData.calories / profile.target) * 100;
                  
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="text-white/70 text-sm w-20">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="flex-1 h-8 bg-white/20 rounded-lg overflow-hidden">
                        <div 
                          className={`h-full rounded-lg transition-all ${
                            percentage > 100 ? 'bg-gradient-to-r from-red-400 to-red-500' : 
                            percentage > 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                            'bg-gradient-to-r from-yellow-400 to-yellow-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="text-white text-sm w-20 text-right">
                        {dayData.calories} cal
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Section */}
          <div className="mt-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="I ate a sandwich..."
                className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white placeholder-white/70 border border-white/30 focus:outline-none focus:border-white/50"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim()}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;