import { Tabs } from 'expo-router'
import {Ionicons} from "@expo/vector-icons"
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Tablayout() {
  const inset = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4c6aafff",
        headerTitleStyle: {
          color: "",
          fontWeight: "600",
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#cfdbf9ff",
          borderTopWidth: 1,
          borderTopColor: "#4c6aafff",
          paddingTop:5,
          height: 60 +inset.bottom,
          paddingBottom:inset.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="chart"
        options={{
          title: "Chart",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "create",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: "members",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}