import { View, Text, StyleSheet } from 'react-native';
import { colors , themedStyles } from '@/theme';

type Props = {
  initials: string;
  size?: number;
  color?: string;
  ring?: boolean;
};

/** Initials-based avatar (no network images needed). */
export function Avatar({ initials, size = 40, color = colors.primary, ring }: Props) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        },
        ring && styles.ring,
      ]}
    >
      <Text style={{ color: colors.white, fontWeight: '700', fontSize: size * 0.4 }}>
        {initials}
      </Text>
    </View>
  );
}

const styles = themedStyles((colors) => ({
  ring: { borderWidth: 2, borderColor: colors.primary },
}));
