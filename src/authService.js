/**
 * @file authService.js
 * Serviço centralizado de autenticação
 * Encapsula toda a lógica Supabase Auth + Profiles
 */

import { SUPABASE, TABLES, MESSAGES, LIMITS } from './constants.js';
import { isValidEmail, isValidPassword, normalizeString } from './utils.js';

let supabaseClient = null;

/**
 * Inicializa cliente Supabase
 * @param {Object} client - Cliente Supabase pré-criado
 */
export function initAuthService(client) {
  supabaseClient = client;
}

/**
 * Regista novo utilizador
 * @param {string} name - Nome completo
 * @param {string} email - E-mail
 * @param {string} username - Nome de utilizador
 * @param {string} password - Senha
 * @returns {Promise<{success: boolean, message: string, user?: Object, requiresEmailVerification?: boolean}>}
 */
export async function registerUser(name, email, username, password) {
  // Validação
  if (!isValidEmail(email)) {
    return { success: false, message: 'E-mail inválido.' };
  }
  if (!isValidPassword(password)) {
    return { success: false, message: MESSAGES.AUTH.PASSWORD_MIN_LENGTH };
  }
  if (!isValidEmail(email)) {
    return { success: false, message: 'Preencha todos os campos (Senha mín 6 caracteres).' };
  }

  const { data: authData, error: authError } = await supabaseClient.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  });

  if (authError) {
    return { success: false, message: MESSAGES.AUTH.REGISTER_FAILED + authError.message };
  }

  if (!authData.user) {
    return { success: false, message: 'Falha ao criar utilizador.' };
  }

  // Salva profile na BD
  const profileData = {
    id: authData.user.id,
    name: normalizeString(name),
    email: email.trim().toLowerCase(),
    username: normalizeString(username).toLowerCase(),
  };

  const { error: profileError } = await supabaseClient
    .from(TABLES.PROFILES)
    .insert([profileData]);

  if (profileError) {
    return {
      success: false,
      message: MESSAGES.AUTH.PROFILE_CREATION_FAILED + profileError.message,
    };
  }

  // Verifica se é necessário confirmar e-mail
  const requiresVerification = !authData.session;

  return {
    success: true,
    message: requiresVerification
      ? MESSAGES.AUTH.EMAIL_VERIFICATION_REQUIRED
      : 'Utilizador registado com sucesso!',
    user: profileData,
    requiresEmailVerification: requiresVerification,
  };
}

/**
 * Faz login
 * @param {string} email - E-mail
 * @param {string} password - Senha
 * @returns {Promise<{success: boolean, message?: string, user?: Object}>}
 */
export async function loginUser(email, password) {
  if (!email.trim() || !password) {
    return { success: false, message: MESSAGES.AUTH.LOGIN_REQUIRED };
  }

  const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (authError) {
    const message =
      authError.message === 'Invalid login credentials'
        ? MESSAGES.AUTH.INVALID_CREDENTIALS
        : MESSAGES.AUTH.LOGIN_FAILED + authError.message;
    return { success: false, message };
  }

  // Busca perfil
  const { data: profile, error: profileError } = await supabaseClient
    .from(TABLES.PROFILES)
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    return { success: false, message: MESSAGES.AUTH.PROFILE_NOT_FOUND };
  }

  return {
    success: true,
    user: { id: authData.user.id, ...profile },
  };
}

/**
 * Faz logout
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function logoutUser() {
  const { error } = await supabaseClient.auth.signOut();
  return {
    success: !error,
    message: error ? error.message : 'Logout bem-sucedido.',
  };
}

/**
 * Obtém sessão atual
 * @returns {Promise<{user?: Object, session?: Object}>}
 */
export async function getSession() {
  const { data } = await supabaseClient.auth.getSession();
  return data || {};
}

/**
 * Carrega perfil do utilizador autenticado
 * @param {string} userId - UUID do utilizador
 * @returns {Promise<{success: boolean, user?: Object, message?: string}>}
 */
export async function loadUserProfile(userId) {
  const { data: profile, error } = await supabaseClient
    .from(TABLES.PROFILES)
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { success: false, message: MESSAGES.AUTH.PROFILE_NOT_FOUND };
  }

  return {
    success: true,
    user: { id: userId, ...profile },
  };
}

/**
 * Envia link de recuperação de senha
 * @param {string} email - E-mail
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendPasswordRecovery(email) {
  if (!isValidEmail(email)) {
    return { success: false, message: 'E-mail inválido.' };
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(
    email.trim().toLowerCase()
  );

  if (error) {
    return { success: false, message: MESSAGES.AUTH.PASSWORD_RECOVERY_FAILED + error.message };
  }

  return {
    success: true,
    message: MESSAGES.AUTH.PASSWORD_RECOVERY_SENT,
  };
}

/**
 * Atualiza senha (após recuperação ou mudança de utilizador)
 * @param {string} newPassword - Nova senha
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function updateUserPassword(newPassword) {
  if (!isValidPassword(newPassword)) {
    return { success: false, message: MESSAGES.AUTH.PASSWORD_MIN_LENGTH_UPDATE };
  }

  const { error } = await supabaseClient.auth.updateUser({ password: newPassword });

  if (error) {
    return { success: false, message: MESSAGES.AUTH.PASSWORD_UPDATE_FAILED + error.message };
  }

  return {
    success: true,
    message: MESSAGES.AUTH.PASSWORD_UPDATE_SUCCESS,
  };
}

/**
 * Configura listener para eventos de autenticação
 * @param {Function} callback - (event, session) => void
 * @returns {Object} Subscription para cleanup
 */
export function onAuthStateChange(callback) {
  const { data } = supabaseClient.auth.onAuthStateChange(callback);
  return data;
}
