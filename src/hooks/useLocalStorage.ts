import { useState, useEffect, useCallback } from 'react';

/**
 * Hook genérico para persistência em localStorage
 *
 * Features:
 * - Getter/setter tipado
 * - Serialização JSON automática
 * - Fallback para valor default
 * - Sincronização entre abas
 *
 * @param key - Chave do localStorage
 * @param defaultValue - Valor padrão caso não exista
 * @returns [value, setValue, removeValue]
 *
 * @example
 * const [user, setUser] = useLocalStorage<User | null>('user', null);
 * const [theme, setTheme] = useLocalStorage('theme', 'dark');
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Função para ler do localStorage
  const readValue = useCallback((): T => {
    // SSR check
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error);
      return defaultValue;
    }
  }, [key, defaultValue]);

  // Estado local
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Função para salvar no localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      // SSR check
      if (typeof window === 'undefined') {
        console.warn(`Tentativa de salvar "${key}" durante SSR`);
        return;
      }

      try {
        // Permite função como valor (como useState)
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Salva no state
        setStoredValue(valueToStore);

        // Salva no localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // Dispara evento para outras abas
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(valueToStore),
          })
        );
      } catch (error) {
        console.warn(`Erro ao salvar localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Função para remover do localStorage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(key);
      setStoredValue(defaultValue);

      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: null,
        })
      );
    } catch (error) {
      console.warn(`Erro ao remover localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // Sincronização entre abas
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) return;

      if (event.newValue === null) {
        setStoredValue(defaultValue);
      } else {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch {
          setStoredValue(defaultValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue]);

  // Sincroniza com localStorage na montagem
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
