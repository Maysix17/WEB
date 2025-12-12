import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

class PermissionErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Report error to error tracking service if available
    if (__DEV__) {
      // In development, also show native alert for visibility
      setTimeout(() => {
        Alert.alert(
          'Error en la Aplicación',
          `Error: ${error.message}\n\nLa aplicación intentará recuperarse automáticamente.`,
          [
            {
              text: 'OK',
              onPress: () => this.handleRetry()
            }
          ]
        );
      }, 100);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    // In a real app, you might want to restart the app or reset the navigation stack
    this.handleRetry();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Error en la Aplicación</Text>
            <Text style={styles.errorMessage}>
              Ha ocurrido un error inesperado en la aplicación.
              Esto puede deberse a problemas de conectividad, configuración o un bug temporal.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Detalles del error (desarrollo):</Text>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>{this.state.errorInfo.componentStack}</Text>
                )}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.reloadButton} onPress={this.handleReload}>
                <Text style={styles.reloadButtonText}>Recargar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Wrapper component that works in any context
const PermissionErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
  return (
    <PermissionErrorBoundaryClass fallback={fallback}>
      {children}
    </PermissionErrorBoundaryClass>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#066839',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  reloadButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  reloadButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PermissionErrorBoundary;