import { Tabs } from 'expo-router'

export default function Tablayout() {
  return (
    <Tabs>
      <Tabs.Screen name="chart" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="members" />
    </Tabs>
  );
}