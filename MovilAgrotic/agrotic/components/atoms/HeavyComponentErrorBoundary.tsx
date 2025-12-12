import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface Props {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRetry?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

class HeavyComponentErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.componentName || 'HeavyComponent'}:`, error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to external service in production
    if (!__DEV__) {
      // TODO: Send to error reporting service
      // logErrorToService(error, errorInfo, this.props.componentName);
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;

    if (retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: retryCount + 1,
      });
    } else {
      Alert.alert(
        'Error Persistente',
        'El componente ha fallado múltiples veces. Reinicie la aplicación.',
        [{ text: 'OK' }]
      );
    }
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    const errorDetails = `
Component: ${this.props.componentName || 'Unknown'}
Error: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace'}
Component Stack: ${errorInfo?.componentStack || 'No component stack'}
    `.trim();

    Alert.alert(
      'Reportar Error',
      '¿Desea reportar este error para ayudar a mejorar la aplicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reportar',
          onPress: () => {
            // TODO: Implement error reporting
            console.log('Error report:', errorDetails);
            Alert.alert('Gracias', 'El error ha sido reportado. Gracias por ayudar a mejorar la aplicación.');
          }
        }
      ]
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>
              ¡Ups! Algo salió mal
            </Text>
            <Text style={styles.errorMessage}>
              El componente "{this.props.componentName || 'HeavyComponent'}" ha tenido un problema.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailTitle}>Detalles del error:</Text>
                <Text style={styles.errorDetailText}>
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              {this.props.showRetry !== false && this.state.retryCount < this.maxRetries && (
                <TouchableOpacity
                  style={[styles.button, styles.retryButton]}
                  onPress={this.handleRetry}
                >
                  <Text style={styles.retryButtonText}>
                    Reintentar ({this.state.retryCount}/{this.maxRetries})
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, styles.reportButton]}
                onPress={this.handleReportError}
              >
                <Text style={styles.reportButtonText}>
                  Reportar Error
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook personalizado para usar error boundaries en componentes funcionales
 */
export function useErrorHandler(componentName?: string) {
  return React.useCallback((error: Error, errorInfo: ErrorInfo) => {
    console.error(`Error in ${componentName || 'Component'}:`, error, errorInfo);

    // Log to external service
    if (!__DEV__) {
      // TODO: Send to error reporting service
    }
  }, [componentName]);
}

/**
 * HOC para envolver componentes con error boundary
 */
export function withHeavyComponentErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
  options?: {
    fallback?: ReactNode;
    showRetry?: boolean;
  }
) {
  const WrappedComponent = (props: P) => (
    <HeavyComponentErrorBoundary
      componentName={componentName || Component.displayName || Component.name}
      fallback={options?.fallback}
      showRetry={options?.showRetry}
    >
      <Component {...props} />
    </HeavyComponentErrorBoundary>
  );

  WrappedComponent.displayName = `withHeavyComponentErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  errorContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 400,
    width: '100%',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorDetailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  errorDetailText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  reportButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HeavyComponentErrorBoundary;