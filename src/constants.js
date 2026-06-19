/**
 * @file constants.js
 * Centralizador de constantes: cores, textos, valores padrão
 */

// ═══════════════════════════════════════════════════════════════
// SUPABASE CONFIG
// ═══════════════════════════════════════════════════════════════
export const SUPABASE = {
  URL: 'https://tpyposwehfijibzhjuxk.supabase.co',
  ANON_KEY: 'sb_publishable_Wbvoq2RMCGHJDXL53pl-rw_bzF9Fo3i',
};

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS (Cores, Tipografia)
// ═══════════════════════════════════════════════════════════════
export const COLORS = {
  background: '#0d1117',
  surface: '#141929',
  surfaceHover: '#1a1f2e',
  border: '#252d4a',
  borderDark: '#1a1e30',
  primary: '#3f51b5',
  primaryDark: '#283593',
  primaryLight: '#5c6bc0',
  success: '#43a047',
  warning: '#fb8c00',
  danger: '#ef5350',
  dangerBg: '#1a1010',
  dangerBorder: '#3a1a1a',
  text: '#e8eaf6',
  textMuted: '#9fa8da',
  textSecondary: '#7986cb',
  textTertiary: '#5c6bc0',
  textDisabled: '#353e5c',
  notification: '#0e1322',
};

export const TYPOGRAPHY = {
  fontFamily: "'DM Sans', sans-serif",
  fontMono: "'DM Mono', monospace",
};

// ═══════════════════════════════════════════════════════════════
// DIAS DA SEMANA
// ═══════════════════════════════════════════════════════════════
export const WEEKDAYS = {
  SHORT: ["Seg", "Ter", "Qua", "Qui", "Sex"],
  LONG: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
};

export const WEEKDAY_INDEX = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
};

// ═══════════════════════════════════════════════════════════════
// LIMITES E VALIDAÇÃO
// ═══════════════════════════════════════════════════════════════
export const LIMITS = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_SEATS: 8,
  MIN_SEATS: 1,
  MAX_NOTIFICATIONS: 50,
  CHAT_MESSAGE_MAX_LENGTH: 500,
};

// ═══════════════════════════════════════════════════════════════
// MENSAGENS DE ERRO PADRÃO
// ═══════════════════════════════════════════════════════════════
export const MESSAGES = {
  AUTH: {
    LOGIN_REQUIRED: 'Preencha e-mail e senha.',
    INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
    LOGIN_FAILED: 'Falha no login: ',
    REGISTER_FAILED: 'Erro ao criar conta: ',
    PROFILE_NOT_FOUND: 'Erro ao buscar perfil.',
    PROFILE_CREATION_FAILED: 'Usuário criado, mas erro ao salvar perfil: ',
    PASSWORD_MIN_LENGTH: `Preencha todos os campos (Senha mín ${LIMITS.MIN_PASSWORD_LENGTH} caracteres).`,
    PASSWORD_RECOVERY_SENT: 'Se este e-mail estiver cadastrado, um link de recuperação foi enviado para sua caixa de entrada.',
    PASSWORD_RECOVERY_FAILED: 'Erro: ',
    EMAIL_VERIFICATION_REQUIRED: 'Cadastro recebido! Verifique a caixa de entrada do seu e-mail para confirmar a conta.',
    PASSWORD_UPDATE_SUCCESS: 'Sua senha foi atualizada com sucesso!',
    PASSWORD_UPDATE_FAILED: 'Erro ao atualizar senha: ',
    PASSWORD_MIN_LENGTH_UPDATE: `A nova senha deve ter no mínimo ${LIMITS.MIN_PASSWORD_LENGTH} caracteres.`,
  },
  TRIPS: {
    FETCH_FAILED: 'Erro ao buscar caronas: ',
    CREATE_FAILED: 'Erro ao salvar carona: ',
    EDIT_FAILED: 'Erro ao editar carona: ',
    DELETE_FAILED: 'Erro ao deletar: ',
    JOIN_FAILED: 'Erro ao entrar: ',
    LEAVE_FAILED: 'Erro ao sair: ',
    NO_TRIPS: 'Nenhuma carona para este dia.',
  },
  SYNC: 'Sincronizando com a nuvem...',
  NOTIFICATIONS: {
    EMPTY: 'Nenhuma notificação.',
  },
};

// ═══════════════════════════════════════════════════════════════
// TABELAS SUPABASE
// ═══════════════════════════════════════════════════════════════
export const TABLES = {
  PROFILES: 'profiles',
  TRIPS: 'trips',
  MESSAGES: 'messages',
};

// ═══════════════════════════════════════════════════════════════
// EVENTOS REALTIME
// ═══════════════════════════════════════════════════════════════
export const REALTIME_EVENTS = {
  CHANNEL: 'notificacoes-app',
  ALL: '*',
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
};
