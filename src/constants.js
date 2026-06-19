window.APP = window.APP || {};

(function(APP) {
  APP.SUPABASE = {
   URL: 'https://erdexlbzqdvsvsybropv.supabase.co',
    KEY: 'sb_publishable_iyVI4cu5LKkzUyrUzH_zdQ_MlxJq3sT',
  };
  APP.COLORS = {
    PRIMARY: '#5c6bc0',
    BACKGROUND: '#0d1117',
    SURFACE: '#141929',
    TEXT: '#e8eaf6',
    TEXT_SECONDARY: '#9fa8da',
    ERROR: '#ef5350',
    SUCCESS: '#43a047',
    BORDER: '#252d4a',
  };

  APP.TYPOGRAPHY = {
    FONT_SANS: "'DM Sans', sans-serif",
    FONT_MONO: "'DM Mono', monospace",
  };

  APP.WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  APP.WEEKDAYS_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

  APP.TABLES = {
    PROFILES: 'profiles',
    TRIPS: 'trips',
    MESSAGES: 'messages',
  };

  APP.LIMITS = {
    MIN_PASSWORD: 6,
    MAX_SEATS: 8,
    MIN_SEATS: 1,
  };

  APP.MESSAGES = {
    AUTH: {
      LOGIN_REQUIRED: 'Preencha e-mail e senha.',
      INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
      PASSWORD_MIN_LENGTH: 'Senha mínimo 6 caracteres.',
      REGISTER_FAILED: 'Erro ao criar conta: ',
      PROFILE_CREATION_FAILED: 'Usuário criado, mas erro ao salvar perfil: ',
      EMAIL_VERIFICATION_REQUIRED: 'Verifique sua caixa de entrada.',
      PROFILE_NOT_FOUND: 'Erro ao buscar perfil.',
      PASSWORD_RECOVERY_SENT: 'Link de recuperação enviado.',
      PASSWORD_RECOVERY_FAILED: 'Erro ao recuperar senha: ',
      PASSWORD_UPDATE_SUCCESS: 'Senha atualizada com sucesso!',
      PASSWORD_UPDATE_FAILED: 'Erro ao atualizar senha: ',
    },
  };
})(window.APP);