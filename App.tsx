/**
 * App — 루트 컴포넌트. 프로바이더 래핑만 담당.
 * SafeAreaProvider(노치 대응) > AppProvider(전역 상태) > HomeScreen(유일한 화면).
 */
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <HomeScreen />
      </AppProvider>
    </SafeAreaProvider>
  );
}
