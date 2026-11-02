import React from 'react';
import { Tabs } from 'expo-router';
import { CustomTabBar } from '@/components/ui/CustomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="workouts" />
      <Tabs.Screen name="timer" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
