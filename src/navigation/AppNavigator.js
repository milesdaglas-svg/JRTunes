import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { colors } from '../theme/theme';

import LibraryScreen from '../screens/LibraryScreen';
import OnlineSearchScreen from '../screens/OnlineSearchScreen';
import PodcastScreen from '../screens/PodcastScreen';
import DownloadsScreen from '../screens/DownloadsScreen';
import PlayerScreen from '../screens/PlayerScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => {
          const map = {
            Library: 'hard-drive',
            Discover: 'search',
            Podcasts: 'mic',
            Downloads: 'download',
          };
          return <Icon name={map[route.name]} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Discover" component={OnlineSearchScreen} />
      <Tab.Screen name="Podcasts" component={PodcastScreen} />
      <Tab.Screen name="Downloads" component={DownloadsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.accent,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.accent,
        },
      }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
