/**
 * @file messagesService.js
 * Serviço centralizado de mensagens
 * Envio, busca, realtime
 */

import { TABLES } from './constants.js';

let supabaseClient = null;

/**
 * Inicializa cliente Supabase
 * @param {Object} client - Cliente Supabase
 */
export function initMessagesService(client) {
  supabaseClient = client;
}

/**
 * Formata mensagem bruta da BD
 * @param {Object} rawMsg - Dados da BD
 * @returns {Object} Message formatado
 * @private
 */
function formatMessage(rawMsg) {
  return {
    id: rawMsg.id,
    tripId: rawMsg.trip_id,
    userId: rawMsg.user_id,
    userName: rawMsg.user_name,
    text: rawMsg.text,
    createdAt: rawMsg.created_at,
  };
}

/**
 * Busca todas as mensagens de uma carona
 * @param {string} tripId - UUID da carona
 * @returns {Promise<{success: boolean, messages?: Array, message?: string}>}
 */
export async function fetchMessagesByTrip(tripId) {
  const { data, error } = await supabaseClient
    .from(TABLES.MESSAGES)
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true });

  if (error) {
    return { success: false, message: 'Erro ao buscar mensagens.' };
  }

  const messages = data.map(formatMessage);
  return { success: true, messages };
}

/**
 * Envia nova mensagem
 * @param {string} tripId - UUID da carona
 * @param {string} userId - UUID do remetente
 * @param {string} userName - Nome do remetente
 * @param {string} text - Conteúdo
 * @returns {Promise<{success: boolean, messageId?: string, message?: string}>}
 */
export async function sendMessage(tripId, userId, userName, text) {
  // Validação
  const trimmedText = text.trim();
  if (!trimmedText) {
    return { success: false, message: 'Mensagem vazia.' };
  }

  const insertData = {
    trip_id: tripId,
    user_id: userId,
    user_name: userName,
    text: trimmedText,
  };

  const { data, error } = await supabaseClient
    .from(TABLES.MESSAGES)
    .insert([insertData])
    .select();

  if (error) {
    return { success: false, message: 'Erro ao enviar mensagem.' };
  }

  return { success: true, messageId: data[0].id, message: formatMessage(data[0]) };
}

/**
 * Listener para novas mensagens (realtime)
 * @param {Function} callback - (payload) => void
 * @returns {Object} Channel subscription
 */
export function subscribeToMessages(callback) {
  return supabaseClient
    .channel('messages-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: TABLES.MESSAGES },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

/**
 * Deleta mensagem (soft delete, se necessário)
 * @param {string} messageId - UUID da mensagem
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function deleteMessage(messageId) {
  const { error } = await supabaseClient
    .from(TABLES.MESSAGES)
    .delete()
    .eq('id', messageId);

  if (error) {
    return { success: false, message: 'Erro ao eliminar mensagem.' };
  }

  return { success: true };
}
