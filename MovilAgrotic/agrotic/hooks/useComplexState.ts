import { useReducer, useCallback } from 'react';

/**
 * Hook personalizado para manejar estados complejos con useReducer
 * Útil para componentes con múltiples estados relacionados
 */

export interface ComplexState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
}

export type ComplexAction<T> =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: T }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_DATA'; payload: Partial<T> }
  | { type: 'RESET' }
  | { type: 'SET_LAST_UPDATED' };

function complexStateReducer<T>(
  state: ComplexState<T>,
  action: ComplexAction<T>
): ComplexState<T> {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DATA':
      return {
        ...state,
        data: action.payload,
        loading: false,
        error: null,
        lastUpdated: Date.now()
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_DATA':
      return {
        ...state,
        data: { ...state.data, ...action.payload },
        lastUpdated: Date.now()
      };
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: Date.now() };
    case 'RESET':
      return {
        data: {} as T,
        loading: false,
        error: null,
        lastUpdated: 0
      };
    default:
      return state;
  }
}

/**
 * Hook para manejar estados complejos con operaciones CRUD
 */
export function useComplexState<T>(initialData: T = {} as T) {
  const [state, dispatch] = useReducer(complexStateReducer<T>, {
    data: initialData,
    loading: false,
    error: null,
    lastUpdated: 0,
  });

  const actions = {
    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),

    setData: useCallback((data: T) => {
      dispatch({ type: 'SET_DATA', payload: data });
    }, []),

    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),

    updateData: useCallback((updates: Partial<T>) => {
      dispatch({ type: 'UPDATE_DATA', payload: updates });
    }, []),

    reset: useCallback(() => {
      dispatch({ type: 'RESET' });
    }, []),

    setLastUpdated: useCallback(() => {
      dispatch({ type: 'SET_LAST_UPDATED' });
    }, []),
  };

  return {
    ...state,
    ...actions,
  };
}

/**
 * Hook específico para formularios con validación
 */
export interface FormState<T> extends ComplexState<T> {
  isDirty: boolean;
  isValid: boolean;
  touched: Record<keyof T, boolean>;
}

export type FormAction<T> =
  | ComplexAction<T>
  | { type: 'SET_FIELD'; payload: { field: keyof T; value: any } }
  | { type: 'SET_TOUCHED'; payload: { field: keyof T; touched: boolean } }
  | { type: 'SET_MULTIPLE_TOUCHED'; payload: Record<keyof T, boolean> }
  | { type: 'VALIDATE'; payload: { isValid: boolean } };

function formStateReducer<T>(
  state: FormState<T>,
  action: FormAction<T>
): FormState<T> {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        data: { ...state.data, [action.payload.field]: action.payload.value },
        isDirty: true,
      };
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: { ...state.touched, [action.payload.field]: action.payload.touched },
      };
    case 'SET_MULTIPLE_TOUCHED':
      return {
        ...state,
        touched: { ...state.touched, ...action.payload },
      };
    case 'VALIDATE':
      return {
        ...state,
        isValid: action.payload.isValid,
      };
    default:
      // Handle complex state actions by delegating to complexStateReducer
      const complexAction = action as ComplexAction<T>;
      const baseState = complexStateReducer({
        data: state.data,
        loading: state.loading,
        error: state.error,
        lastUpdated: state.lastUpdated
      }, complexAction);

      return {
        ...baseState,
        isDirty: state.isDirty,
        isValid: state.isValid,
        touched: state.touched,
      };
  }
}

export function useFormState<T>(
  initialData: T = {} as T,
  initialTouched: Record<keyof T, boolean> = {} as Record<keyof T, boolean>
) {
  const [state, dispatch] = useReducer(formStateReducer<T>, {
    data: initialData,
    loading: false,
    error: null,
    lastUpdated: 0,
    isDirty: false,
    isValid: true,
    touched: initialTouched,
  });

  const actions = {
    setField: useCallback((field: keyof T, value: any) => {
      dispatch({ type: 'SET_FIELD', payload: { field, value } });
    }, []),

    setTouched: useCallback((field: keyof T, touched: boolean = true) => {
      dispatch({ type: 'SET_TOUCHED', payload: { field, touched } });
    }, []),

    setMultipleTouched: useCallback((touched: Record<keyof T, boolean>) => {
      dispatch({ type: 'SET_MULTIPLE_TOUCHED', payload: touched });
    }, []),

    validate: useCallback((isValid: boolean) => {
      dispatch({ type: 'VALIDATE', payload: { isValid } });
    }, []),

    // Inherit complex state actions
    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, []),

    setData: useCallback((data: T) => {
      dispatch({ type: 'SET_DATA', payload: data });
    }, []),

    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, []),

    updateData: useCallback((updates: Partial<T>) => {
      dispatch({ type: 'UPDATE_DATA', payload: updates });
    }, []),

    reset: useCallback(() => {
      dispatch({ type: 'RESET' });
    }, []),
  };

  return {
    ...state,
    ...actions,
  };
}

export default useComplexState;