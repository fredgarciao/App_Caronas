/**
 * @file notificationService.js
 * Serviço centralizado de notificações
 * Gerencia estado, triggers, listeners
 */

import { TABLES, REALTIME_EVENTS, LIMITS } from './constants.js';
import { nowTimestamp } from './utils.js';

let supabaseClient = null;
let notificationListeners = [];

/**
 * Inicializa cliente Supabase
 * @param {Object} client - Cliente Supabase
 */
export function initNotificationService(client) {
  supabaseClient = client;
}

/**
 * Cria notificação in-memory (sem persistência em BD)
 * @param {string} text - Texto da notificação
 * @param {string[]} [forUsers] - UUIDs dos utilizadores alvo
 * @returns {Object} Notificação criada
 */
export function createNotification(text, forUsers) {
  const notification = {
    id: 'n' + nowTimestamp() + Math.random(),
    text,
    ts: nowTimestamp(),
    read: false,
    forUsers: forUsers || [],
  };

  // Notifica todos os listeners
  notificationListeners.forEach(listener => {
    listener(notification);
  });

  return notification;
}

/**
 * Marca notificação como lida
 * @param {string} notificationId - ID
 * @param {Array} notifications - Lista de notificações
 * @returns {Array} Lista atualizada
 */
export function markNotificationAsRead(notificationId, notifications) {
  return notifications.map(n =>
    n.id === notificationId ? { ...n, read: true } : n
  );
}

/**
 * Marca todas as notificações como lidas
 * @param {Array} notifications - Lista
 * @returns {Array} Lista atualizada
 */
export function markAllAsRead(notifications) {
  return notifications.map(n => ({ ...n, read: true }));
}

/**
 * Limpa lista de notificações
 * @returns {Array} Array vazio
 */
export function clearAllNotifications() {
  return [];
}

/**
 * Conta notificações não lidas para um utilizador
 * @param {string} userId - UUID do utilizador
 * @param {Array} notifications - Lista de notificações
 * @returns {number} Contagem
 */
export function getUnreadCount(userId, notifications) {
  return notifications.filter(
    n => !n.read && (!n.forUsers || n.forUsers.length === 0 || n.forUsers.includes(userId))
  ).length;
}

/**
 * Filtra notificações relevantes para um utilizador
 * @param {string} userId - UUID
 * @param {Array} notifications - Lista completa
 * @returns {Array} Notificações filtradas
 */
export function getRelevantNotifications(userId, notifications) {
  return notifications.filter(
    n => !n.forUsers || n.forUsers.length === 0 || n.forUsers.includes(userId)
  );
}

/**
 * Limpa notificações antigas (mantém apenas últimas N)
 * @param {Array} notifications - Lista
 * @param {number} [maxSize=50] - Máximo de notificações
 * @returns {Array} Lista trimmed
 */
export function trimOldNotifications(notifications, maxSize = LIMITS.MAX_NOTIFICATIONS) {
  return notifications.slice(0, maxSize);
}

/**
 * Subscreve a criação de notificações
 * @param {Function} callback - (notification) => void
 * @returns {Function} Unsubscribe
 */
export function subscribeToNotifications(callback) {
  notificationListeners.push(callback);
  return () => {
    notificationListeners = notificationListeners.filter(l => l !== callback);
  };
}

/**
 * Listener para mudanças em caronas que devem gerar notificações
 * (chamado pelo hook de realtime)
 * @param {Object} payload - Payload do Supabase
 * @param {string} eventType - INSERT|UPDATE|DELETE
 * @param {string} userId - UUID do utilizador atual
 * @returns {Object|null} Notificação a criar ou null
 */
export function handleTripChangeNotification(payload, eventType, userId) {
  const trip = payload.new || payload.old;

  // UPDATE: avisa participantes sobre mudanças
  if (eventType === 'UPDATE') {
    const wasParticipant = payload.old?.participants?.includes(userId);
    const stillParticipant = payload.new?.participants?.includes(userId);

    if (wasParticipant || stillParticipant) {
      return {
        text: `A carona (${trip.origin} ➔ ${trip.destination}) teve vagas ou informações alteradas!`,
        forUsers: payload.new.participants,
      };
    }
  }

  // DELETE: avisa todos os participantes
  if (eventType === 'DELETE') {
    return {
      text: 'Atenção: Uma carona foi cancelada pelo criador.',
      forUsers: payload.old.participants,
    };
  }

  return null;
}

/**
 * Listener para novas mensagens
 * (chamado pelo hook de realtime)
 * @param {Object} message - Mensagem inserida
 * @param {string} userId - UUID do utilizador atual
 * @returns {Object|null} Notificação a criar ou null
 */
export function handleMessageNotification(message, userId) {
  // Não notifica o próprio remetente
  if (message.user_id === userId) return null;

  return {
    text: `Mensagem em chat: "${message.text.substring(0, 50)}${message.text.length > 50 ? '...' : ''}"`,
    forUsers: [userId], // Apenas para o utilizador
  };
}

/**
 * Listener para novas adesões
 * @param {string} participantName - Nome de quem aderiu
 * @param {string} tripOrigin - Local de partida
 * @param {string} ownerId - UUID do dono da carona
 * @returns {Object} Notificação
 */
export function createJoinNotification(participantName, tripOrigin, ownerId) {
  return {
    text: `${participantName} entrou na sua carona saindo de ${tripOrigin}`,
    forUsers: [ownerId],
  };
}

/**
 * Listener para saídas
 * @param {string} participantName - Nome de quem saiu
 * @param {string} tripOrigin - Local de partida
 * @param {string} ownerId - UUID do dono
 * @returns {Object} Notificação
 */
export function createLeaveNotification(participantName, tripOrigin, ownerId) {
  return {
    text: `${participantName} saiu da sua carona saindo de ${tripOrigin}`,
    forUsers: [ownerId],
  };
}
