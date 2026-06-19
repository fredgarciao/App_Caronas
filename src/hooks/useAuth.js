/**
 * @file hooks/useAuth.js
 * Custom Hook: Autenticação
 * 
 * Encapsula toda a lógica de auth (login, register, logout, session)
 * Gerencia estado (user, loading, error)
 * Listeners para mudanças de sessão
 * 
 * Uso no componente:
 * const { user, loading, error, login, register, logout } = useAuth();
 */

const { useState, useEffect, useCallback } = React;
import { initAuthService, loginUser, registerUser, logoutUser, getSession, loadUserProfile, sendPasswordRecovery, updateUserPassword, onAuthStateChange } from '../authService.js';

/**
 * Custom Hook: Autenticação
 * @param {Object} supabaseClient - Cliente Supabase
 * @returns {Object} Estado e métodos de auth
 */
export function useAuth(supabaseClient) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inicializar serviço na montagem
  useEffect(() => {
    if (!supabaseClient) return;
    initAuthService(supabaseClient);
  }, [supabaseClient]);

  // Carregar sessão existente ao montar
  useEffect(() => {
    if (!supabaseClient) return;

    async function initAuth() {
      try {
        const { session } = await getSession();
        if (session?.user?.id) {
          const result = await loadUserProfile(session.user.id);
          if (result.success) {
            setUser(result.user);
          } else {
            setError(result.message);
          }
        }
      } catch (err) {
        setError('Erro ao inicializar autenticação.');
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // Escuta mudanças de sessão
    const subscription = onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Trigger redefinição de senha
        return;
      }

      if (session?.user?.id) {
        loadUserProfile(session.user.id).then(result => {
          if (result.success) setUser(result.user);
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription?.unsubscribe?.();
  }, [supabaseClient]);

  // Callback: Login
  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    const result = await loginUser(email, password);
    setLoading(false);

    if (result.success) {
      setUser(result.user);
    } else {
      setError(result.message);
    }

    return result;
  }, []);

  // Callback: Registro
  const handleRegister = useCallback(async (name, email, username, password) => {
    setLoading(true);
    setError('');
    const result = await registerUser(name, email, username, password);
    setLoading(false);

    if (result.success && result.requiresEmailVerification === false) {
      setUser(result.user);
    } else if (result.success) {
      setError(result.message);
    } else {
      setError(result.message);
    }

    return result;
  }, []);

  // Callback: Logout
  const handleLogout = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await logoutUser();
    setLoading(false);

    if (result.success) {
      setUser(null);
    } else {
      setError(result.message);
    }

    return result;
  }, []);

  // Callback: Recuperação de Senha
  const handlePasswordRecovery = useCallback(async (email) => {
    setLoading(true);
    setError('');
    const result = await sendPasswordRecovery(email);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }

    return result;
  }, []);

  // Callback: Atualizar Senha
  const handleUpdatePassword = useCallback(async (newPassword) => {
    setLoading(true);
    setError('');
    const result = await updateUserPassword(newPassword);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }

    return result;
  }, []);

  return {
    // Estado
    user,
    loading,
    error,
    isAuthenticated: !!user,

    // Métodos
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    sendPasswordRecovery: handlePasswordRecovery,
    updatePassword: handleUpdatePassword,

    // Helpers
    setError, // Para resetar erros manualmente
  };
}
