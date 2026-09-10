import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { ClaySurface } from './ClaySurface';
/** Labeled text input with optional leading icon and password toggle. */
export function Field({ label, icon, password, style, ...rest }) {
  const [hidden, setHidden] = useState(!!password);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      {/* Rendered "pressed" so wells read as recessed relative to raised buttons/cards. */}
      <ClaySurface radius={radii.md} pressed style={[styles.box, focused && styles.boxFocused]}>
        {icon && <Ionicons name={icon} size={19} color={focused ? colors.primary : colors.textMuted} />}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {password && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={19} color={colors.textMuted} />
          </Pressable>
        )}
      </ClaySurface>
    </View>
  );
}
const styles = themedStyles((colors) => ({
  wrap: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    height: 52,
  },
  boxFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    height: '100%',
  },
}));
