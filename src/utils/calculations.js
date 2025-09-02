// Utility function to calculate BMR and daily calories
export const calculateDailyCalories = (profile) => {
  const { weight, height, age, gender, activityLevel, goal } = profile;
  
  // Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  };
  
  const maintenance = bmr * activityMultipliers[activityLevel];
  
  // Goal adjustments
  let targetCalories = maintenance;
  if (goal === 'lose') {
    targetCalories = maintenance - 500; // 0.5kg per week loss
  } else if (goal === 'gain') {
    targetCalories = maintenance + 500; // 0.5kg per week gain
  }
  
  return {
    bmr: Math.round(bmr),
    maintenance: Math.round(maintenance),
    target: Math.round(targetCalories),
    protein: Math.round(weight * 2), // 2g per kg
    carbs: Math.round(targetCalories * 0.45 / 4), // 45% from carbs
    fat: Math.round(targetCalories * 0.25 / 9) // 25% from fat
  };
};