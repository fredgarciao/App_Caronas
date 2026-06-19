/**
 * @file messagesService.js
 * Serviço centralizado de mensagens
 * Envio, busca, realtime
 */

window.APP = window.APP || {};

(function(APP) {
  let supabaseClient = null;

  APP.initMessagesService = function(client) {
    supabaseClient = client;
  };

  APP.fetchMessages = async function(tripId) {
    const { data, error } = await supabaseClient
      .from(APP.TABLES.MESSAGES)
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true });

    return { data: data || [], error };
  };

  APP.sendMessage = async function(tripId, userId, userName, text) {
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

    return { data: data?.[0] || null, error };
  };

  APP.subscribeToMessages = function(tripId, callback) {
    return supabaseClient
      .channel(`messages:${tripId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, callback)
      .subscribe();
  };
})(window.APP);