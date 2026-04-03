import React from 'react';
import { View, ViewProps, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

type NeuCardProps = ViewProps & {
  className?: string;
  elevated?: boolean;
  variant?: string;
};

const NeuCard = React.forwardRef<React.ComponentRef<typeof View>, NeuCardProps>(
  function NeuCard({ style, elevated = true, children, ...props }, ref) {
    const scheme = useColorScheme() ?? 'dark';
    const colors = Colors[scheme];

    return (
      <View
        ref={ref}
        style={[
          {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            shadowColor: colors.neuShadow,
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: elevated ? 0.6 : 0.3,
            shadowRadius: elevated ? 8 : 4,
            elevation: elevated ? 6 : 3,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }
);

NeuCard.displayName = 'NeuCard';
export { NeuCard };
