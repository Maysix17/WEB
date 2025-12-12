import React, { memo, ReactNode } from 'react';

/**
 * Componente para optimizar renderizado condicional
 * Evita renders innecesarios cuando la condición no cambia
 */
interface ConditionalRenderProps {
  condition: boolean;
  children: ReactNode;
  fallback?: ReactNode;
  renderOnMount?: boolean;
}

const ConditionalRender: React.FC<ConditionalRenderProps> = memo(({
  condition,
  children,
  fallback = null,
  renderOnMount = false
}) => {
  // Si renderOnMount es true, renderiza en el primer mount independientemente de la condición
  const shouldRender = renderOnMount ? true : condition;

  return shouldRender ? <>{children}</> : <>{fallback}</>;
});

ConditionalRender.displayName = 'ConditionalRender';

/**
 * Hook personalizado para renderizado condicional optimizado
 */
export function useConditionalRender() {
  return {
    /**
     * Renderiza children solo si la condición es verdadera
     */
    when: (condition: boolean, children: ReactNode, fallback?: ReactNode) => (
      <ConditionalRender condition={condition} fallback={fallback}>
        {children}
      </ConditionalRender>
    ),

    /**
     * Renderiza children solo si la condición es falsa
     */
    unless: (condition: boolean, children: ReactNode, fallback?: ReactNode) => (
      <ConditionalRender condition={!condition} fallback={fallback}>
        {children}
      </ConditionalRender>
    ),

    /**
     * Renderiza children basado en múltiples condiciones
     */
    switch: (
      conditions: Array<{ condition: boolean; children: ReactNode }>,
      fallback?: ReactNode
    ) => {
      const match = conditions.find(({ condition }) => condition);
      return match ? <>{match.children}</> : <>{fallback}</>;
    },
  };
}

/**
 * Componente para renderizado condicional con lazy loading
 */
interface LazyConditionalRenderProps extends ConditionalRenderProps {
  lazy?: boolean;
}

const LazyConditionalRender: React.FC<LazyConditionalRenderProps> = memo(({
  condition,
  children,
  fallback = null,
  renderOnMount = false,
  lazy = false
}) => {
  const [hasRendered, setHasRendered] = React.useState(renderOnMount);

  React.useEffect(() => {
    if (condition && !hasRendered) {
      setHasRendered(true);
    }
  }, [condition, hasRendered]);

  // Si lazy es true, una vez renderizado, mantiene el componente
  const shouldRender = lazy ? (hasRendered || condition) : condition;

  return shouldRender ? <>{children}</> : <>{fallback}</>;
});

LazyConditionalRender.displayName = 'LazyConditionalRender';

/**
 * Hook para optimización de listas grandes
 */
export function useOptimizedList<T>(
  items: T[],
  keyExtractor: (item: T, index: number) => string
) {
  return React.useMemo(() => {
    return items.map((item, index) => ({
      item,
      key: keyExtractor(item, index),
      index
    }));
  }, [items, keyExtractor]);
}

/**
 * Componente para renderizado de listas optimizadas
 */
interface OptimizedListProps<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  emptyComponent?: ReactNode;
  containerStyle?: any;
}

function OptimizedListComponent<T extends Record<string, any>>({
  items,
  keyExtractor,
  renderItem,
  emptyComponent,
  containerStyle
}: OptimizedListProps<T>) {
  const optimizedItems = useOptimizedList(items, keyExtractor);

  if (items.length === 0 && emptyComponent) {
    return <>{emptyComponent}</>;
  }

  return (
    <React.Fragment>
      {optimizedItems.map(({ item, key, index }) => (
        <React.Fragment key={key}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}
    </React.Fragment>
  );
}

export const OptimizedList = memo(OptimizedListComponent) as <T extends Record<string, any>>(
  props: OptimizedListProps<T>
) => React.JSX.Element;

export { ConditionalRender, LazyConditionalRender };
export default ConditionalRender;