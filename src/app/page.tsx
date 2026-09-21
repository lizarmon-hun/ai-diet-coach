'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ProfileModal } from '@/components/ProfileModal';
import { FoodModal } from '@/components/FoodModal';
import { WorkoutModal } from '@/components/WorkoutModal';
import { CalorieBalanceCard } from '@/components/CalorieBalanceCard';
import { PredictionCard } from '@/components/PredictionCard';
import { MealList } from '@/components/MealList';
import { WorkoutList } from '@/components/WorkoutList';
import { UserProfile, DayLog, MealRecord, WorkoutRecord, DietPrediction } from '@/types/diet';
import {
  getTodayDateString,
  loadUserProfile,
  saveUserProfile,
  getDayLog,
  addMealToDay,
  deleteMealFromDay,
  addWorkoutToDay,
  deleteWorkoutFromDay,
  saveDayLog,
} from '@/lib/storage';
import { getDefaultProfile, computeDietPrediction } from '@/lib/calculator';
import { Flame, Sparkles, Utensils, Dumbbell, Target } from 'lucide-react';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile>(getDefaultProfile());
  const [dayLog, setDayLog] = useState<DayLog>({
    date: '',
    meals: [],
    workouts: [],
    prediction: computeDietPrediction(getDefaultProfile(), [], []),
  });
  const [isClient, setIsClient] = useState(false);

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFoodOpen, setIsFoodOpen] = useState(false);
  const [isWorkoutOpen, setIsWorkoutOpen] = useState(false);

  // Initialize on client
  useEffect(() => {
    setIsClient(true);
    const today = getTodayDateString();
    setSelectedDate(today);
    const loadedProfile = loadUserProfile();
    setProfile(loadedProfile);
    const loadedLog = getDayLog(today, loadedProfile);
    setDayLog(loadedLog);
  }, []);

  // When date changes
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const log = getDayLog(newDate, profile);
    setDayLog(log);
  };

  // Save Profile
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile);
    // Recompute current day's prediction with new profile
    const updatedPrediction = computeDietPrediction(newProfile, dayLog.meals, dayLog.workouts);
    const updatedLog: DayLog = {
      ...dayLog,
      prediction: updatedPrediction,
    };
    setDayLog(updatedLog);
    saveDayLog(updatedLog);
  };

  // Add Meal
  const handleSaveMeal = (meal: MealRecord) => {
    const updatedLog = addMealToDay(selectedDate, meal, profile);
    setDayLog(updatedLog);
  };

  // Delete Meal
  const handleDeleteMeal = (mealId: string) => {
    const updatedLog = deleteMealFromDay(selectedDate, mealId, profile);
    setDayLog(updatedLog);
  };

  // Add Workout
  const handleSaveWorkout = (workout: WorkoutRecord) => {
    const updatedLog = addWorkoutToDay(selectedDate, workout, profile);
    setDayLog(updatedLog);
  };

  // Delete Workout
  const handleDeleteWorkout = (workoutId: string) => {
    const updatedLog = deleteWorkoutFromDay(selectedDate, workoutId, profile);
    setDayLog(updatedLog);
  };

  // Update AI Feedback
  const handleUpdateFeedback = (feedback: DietPrediction['aiFeedback']) => {
    if (!dayLog.prediction) return;
    const updatedPrediction = {
      ...dayLog.prediction,
      aiFeedback: feedback,
    };
    const updatedLog = {
      ...dayLog,
      prediction: updatedPrediction,
    };
    setDayLog(updatedLog);
    saveDayLog(updatedLog);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex items-center gap-2 text-zinc-500 font-medium">
          <Flame className="w-6 h-6 text-emerald-500 animate-bounce" />
          <span>AI 다이어트 코치 로딩 중...</span>
        </div>
      </div>
    );
  }

  const prediction = dayLog.prediction || computeDietPrediction(profile, dayLog.meals, dayLog.workouts);
  const remainingWeight = (profile.weight - profile.targetWeight).toFixed(1);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Top Navbar */}
      <Header
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onOpenProfile={() => setIsProfileOpen(true)}
        profile={profile}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Hero Motivational Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 sm:p-7 shadow-lg shadow-emerald-600/15">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white/95">
                <Sparkles className="w-3.5 h-3.5" />
                <span>스마트 비전 AI 다이어트 예측 시스템</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                오늘의 식단 사진과 운동으로 예측하는 체중 변화
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl">
                사진을 찍어 올리면 AI가 칼로리를 자동 계산하고, 운동량과 결합하여 한 달 뒤 목표 체중 달성 여부를 정밀 분석합니다.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsFoodOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Utensils className="w-4 h-4 text-orange-500" />
                <span>식단 사진 등록</span>
              </button>

              <button
                onClick={() => setIsWorkoutOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-emerald-800/80 hover:bg-emerald-900/80 border border-emerald-400/30 text-white rounded-2xl font-bold text-xs sm:text-sm backdrop-blur-md shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Dumbbell className="w-4 h-4 text-teal-300" />
                <span>운동 기록하기</span>
              </button>
            </div>
          </div>

          {/* Decorative background glow */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* 1. Core AI Prediction Engine Card */}
        <PredictionCard
          prediction={prediction}
          profile={profile}
          meals={dayLog.meals}
          workouts={dayLog.workouts}
          onUpdateFeedback={handleUpdateFeedback}
        />

        {/* 2. Real-time Calorie Deficit / Surplus & Macro Breakdown */}
        <CalorieBalanceCard prediction={prediction} profile={profile} />

        {/* 3. Daily Logs: Meals & Workouts 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meals */}
          <MealList
            meals={dayLog.meals}
            onOpenAddMeal={() => setIsFoodOpen(true)}
            onDeleteMeal={handleDeleteMeal}
          />

          {/* Workouts */}
          <WorkoutList
            workouts={dayLog.workouts}
            onOpenAddWorkout={() => setIsWorkoutOpen(true)}
            onDeleteWorkout={handleDeleteWorkout}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-400">
        <p>AI 다이어트 코치 • Powered by Google Gemini Vision & Next.js</p>
      </footer>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      <FoodModal
        isOpen={isFoodOpen}
        onClose={() => setIsFoodOpen(false)}
        selectedDate={selectedDate}
        onSaveMeal={handleSaveMeal}
      />

      <WorkoutModal
        isOpen={isWorkoutOpen}
        onClose={() => setIsWorkoutOpen(false)}
        selectedDate={selectedDate}
        profile={profile}
        onSaveWorkout={handleSaveWorkout}
      />
    </div>
  );
}
