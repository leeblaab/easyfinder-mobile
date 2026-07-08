import 'nativewind/types';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }

  interface TextProps {
    className?: string;
  }

  interface ScrollViewProps {
    className?: string;
  }

  interface FlatListProps<T> {
    className?: string;
  }

  interface PressableProps {
    className?: string;
  }

  interface ImageProps {
    className?: string;
  }

  interface InputAccessoryViewProps {
    className?: string;
  }

  interface SectionListProps<T> {
    className?: string;
  }

  interface VirtualizedListProps<T> {
    className?: string;
  }

  interface KeyboardAvoidingViewProps {
    className?: string;
  }

  interface SafeAreaViewProps {
    className?: string;
  }

  interface StatusBarProps {
    className?: string;
  }
}

declare module 'react-native/Libraries/Animated/NativeAnimatedHelper' {
  interface AnimatedProps<T> {
    className?: string;
  }
}

declare module 'expo-linear-gradient' {
  interface LinearGradientProps {
    className?: string;
  }
}
