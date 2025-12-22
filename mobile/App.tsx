import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import screens
import HomeScreen from './screens/HomeScreen';
import SellScreen from './screens/SellScreen';
import ChatsScreen from './screens/ChatsScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';
import ListingDetailScreen from './screens/ListingDetailScreen';
import ChatDetailScreen from './screens/ChatDetailScreen';

// Icons (using simple text, can replace with expo-vector-icons later)
import { Home, Plus, MessageCircle, User, LogOut } from 'react-native-feather';

import { queryClient } from './lib/queryClient';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} width={size} height={size} />
          ),
        }}
      />
      <Tab.Screen
        name="SellTab"
        component={SellScreen}
        options={{
          title: 'Sell',
          tabBarLabel: 'Sell',
          tabBarIcon: ({ color, size }) => (
            <Plus color={color} width={size} height={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatsTab"
        component={ChatsScreen}
        options={{
          title: 'Chats',
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} width={size} height={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User color={color} width={size} height={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen
                name="Auth"
                component={AuthScreen}
                options={{ animationEnabled: false }}
              />
              <Stack.Screen
                name="HomeTabs"
                component={HomeTabs}
                options={{ animationEnabled: false }}
              />
              <Stack.Screen
                name="ListingDetail"
                component={ListingDetailScreen}
              />
              <Stack.Screen
                name="ChatDetail"
                component={ChatDetailScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar barStyle="dark-content" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
