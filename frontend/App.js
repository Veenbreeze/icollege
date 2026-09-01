import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>iCollege</Text>
        <Text style={styles.subtitle}>Your Campus. Your Community. Your Future.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#3E22D9',
    fontSize: 36,
    fontWeight: '700',
  },
  subtitle: {
    color: '#4B5563',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});
