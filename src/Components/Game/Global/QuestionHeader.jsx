import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';

const QuestionHeader = ({ text, style }) => {
  if (!text) return null;
  return (
    <Animated.View entering={FadeInDown.springify()} style={[styles.container, style]}>
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    color: Colors.onSurface,
    textAlign: 'center',
    lineHeight: 32,
  },
});

export default QuestionHeader;
