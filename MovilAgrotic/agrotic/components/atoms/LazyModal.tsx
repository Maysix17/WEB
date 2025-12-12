import React, { Suspense, lazy, ComponentType } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface LazyModalProps {
  isOpen: boolean;
  onClose: () => void;
  [key: string]: any;
}

interface LazyModalWrapperProps<T extends LazyModalProps> {
  modalComponent: ComponentType<T>;
  fallback?: React.ComponentType;
  props: T;
}

// Componente de carga por defecto
const DefaultFallback: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#066839" />
  </View>
);

// Wrapper para carga perezosa de modales
function LazyModalWrapper<T extends LazyModalProps>({
  modalComponent,
  fallback: Fallback = DefaultFallback,
  props
}: LazyModalWrapperProps<T>) {
  const LazyComponent = lazy(() =>
    import(`../organisms/${modalComponent.name}`).catch(() => {
      // Fallback si la importación falla
      return { default: () => <Fallback /> };
    })
  );

  return (
    <Suspense fallback={<Fallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Hook personalizado para crear modales lazy
export function useLazyModal<T extends LazyModalProps>(modalComponent: ComponentType<T>) {
  return React.memo((props: T) => (
    <LazyModalWrapper
      modalComponent={modalComponent}
      props={props}
    />
  ));
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default LazyModalWrapper;