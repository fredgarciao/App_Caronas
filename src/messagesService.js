/**
 * @file messagesService.js
 * Serviço centralizado de mensagens
 * Envio, busca, realtime
 */

window.APP = window.APP || {};

(function(APP) {
  let supabaseClient = null;

  function ensureInitialized() {
    if (!supabaseClient) {
      throw new Error('messagesService não foi inicializado. Chame APP.initMessagesService(client) antes de usar.');
    }
  }

  APP.initMessagesService = function(client) {
    supabaseClient = client;
  };

  APP.fetchMessagesByTrip = async function(tripId) {
    ensureInitialized();
    const { data, error } = await supabaseClient
      .from(APP.TABLES.MESSAGES)
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, messages: [], message: 'Erro ao buscar mensagens: ' + error.message };
    }

    return { success: true, messages: data || [] };
  };

  APP.sendMessage = async function(tripId, userId, userName, text) {
    ensureInitialized();
    const { data, error } = await supabaseClient
      .from(APP.TABLES.MESSAGES)
      .insert([
        {
          trip_id: tripId,
          user_id: userId,
          user_name: userName,
          text,
        },
      ])
      .select();

    if (error) {
      return { success: false, message: 'Erro ao enviar mensagem: ' + error.message };
    }

    return { success: true, data: data?.[0] || null };
  };

  APP.subscribeToMessages = function(callback) {
    ensureInitialized();
    return supabaseClient
      .channel('messages-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        callback(payload.new);
      })
      .subscribe();
  };
})(window.APP);