// src/app.js - INICIALIZADOR CENTRALIZADO
window.APP = window.APP || {};

(function(APP) {
  APP.supabaseClient = null;
  APP.currentUser = null;

  /**
   * Inicializa toda a aplicação
   * Deve ser chamado no HTML após todos os scripts serem carregados
   */
  APP.init = async function() {
    // 1. Cria cliente Supabase
    APP.supabaseClient = window.supabase.createClient(
      APP.SUPABASE.URL,
      APP.SUPABASE.KEY
    );

    // 2. Inicializa serviços
    APP.initAuthService(APP.supabaseClient);
    APP.initTripsService(APP.supabaseClient);
    APP.initMessagesService(APP.supabaseClient);

    // 3. Verifica sessão existente
    const { session } = await APP.getSession();
    if (session) {
      APP.currentUser = await APP.loadUserProfile(session.user.id);
    }

    return { success: true, user: APP.currentUser };
  };

  /**
   * Dispara quando documento está pronto
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      APP.init();
    });
  } else {
    APP.init();
  }
})(window.APP);