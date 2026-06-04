import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <HomeScreen />
    </AppProvider>
  );
}
