import { Text, Image } from 'react-native';
import { colors, themedStyles } from '@/theme';
import { ClaySurface } from './ClaySurface';
/** Avatar with a claymorphism shell — shows a photo if `uri` is set, initials otherwise. */
export function Avatar({ initials, uri, size = 40, color = colors.primary, ring }) {
  return (
    <ClaySurface
      radius={size / 2}
      style={[
        {
          width: size,
          height: size,
          backgroundColor: uri ? colors.surfaceMuted : color,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        ring && styles.ring,
      ]}
    >
      {uri ? (
        <Image
          source={{
            uri,
          }}
          style={{
            width: size,
            height: size,
          }}
        />
      ) : (
        <Text
          style={{
            color: color === colors.white ? colors.text : colors.white,
            fontWeight: '700',
            fontSize: size * 0.4,
          }}
        >
          {initials}
        </Text>
      )}
    </ClaySurface>
  );
}
const styles = themedStyles((colors) => ({
  ring: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
}));
