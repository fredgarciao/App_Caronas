// src/types.js - Apenas JSDoc, não precisa de namespace
/**
 * @typedef {Object} User
 * @property {string} id - UUID
 * @property {string} name - Nome completo
 * @property {string} email - E-mail
 * @property {string} username - Nome de usuário
 */

/**
 * @typedef {Object} Trip
 * @property {string} id - UUID
 * @property {string} owner_id - ID do criador
 * @property {string} owner_name - Nome do criador
 * @property {string} origin - Local de partida
 * @property {string} destination - Local de chegada
 * @property {string} time - Hora (HH:MM)
 * @property {number} total_seats - Total de vagas
 * @property {number} seats_left - Vagas disponíveis
 * @property {string} contact - Telefone do responsável
 * @property {number} day_index - Dia da semana (0-4)
 * @property {string[]} participants - IDs dos participantes
 */

/**
 * @typedef {Object} Message
 * @property {string} id - UUID
 * @property {string} trip_id - ID da carona
 * @property {string} user_id - ID do usuário
 * @property {string} user_name - Nome do usuário
 * @property {string} text - Conteúdo da mensagem
 * @property {string} created_at - Timestamp
 */