import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { ClaySurface } from './ClaySurface';
export function Button({ label, onPress, variant = 'primary', icon, color = colors.primary, style }) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <ClaySurface
          radius={radii.md}
          pressed={pressed}
          style={[
            styles.base,
            isPrimary && {
              backgroundColor: color,
            },
            isOutline && {
              borderWidth: 1.5,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
            variant === 'soft' && {
              backgroundColor: colors.primarySoft,
            },
            pressed && {
              opacity: 0.92,
            },
            style,
          ]}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={isPrimary ? colors.white : color}
              style={{
                marginRight: 8,
              }}
            />
          )}
          <Text
            style={[
              styles.label,
              {
                color: isPrimary ? colors.white : isOutline ? colors.text : color,
              },
            ]}
          >
            {label}
          </Text>
        </ClaySurface>
      )}
    </Pressable>
  );
}
const styles = themedStyles(() => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
}));
