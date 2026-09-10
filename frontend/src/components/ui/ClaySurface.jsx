import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadow } from '@/theme';
/**
 * Puffy claymorphism surface: a native shadow for the "dark" side plus a
 * top-left highlight gradient overlay for the "light" side, since RN only
 * supports one native shadow per view (no CSS-style multi box-shadow).
 */
export function ClaySurface({ style, radius = 20, pressed, children, ...rest }) {
  return (
    <View
      style={[
        {
          borderRadius: radius,
        },
        pressed ? shadow.clayPressed : shadow.clay,
        style,
      ]}
      {...rest}
    >
      <LinearGradient
        colors={[colors.clayHighlightFrom, colors.clayHighlightTo]}
        start={{
          x: 0.1,
          y: 0,
        }}
        end={{
          x: 0.8,
          y: 0.9,
        }}
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: radius,
          opacity: pressed ? 0.4 : 1,
        }}
      />
      {children}
    </View>
  );
}
