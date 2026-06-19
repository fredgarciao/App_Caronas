/**
 * @file types.js
 * Type definitions em JSDoc (preparação para TypeScript futuro)
 */

/**
 * @typedef {Object} User
 * @property {string} id - UUID do utilizador
 * @property {string} name - Nome completo
 * @property {string} email - E-mail corporativo
 * @property {string} username - Nome de utilizador único
 */

/**
 * @typedef {Object} Trip
 * @property {string} id - UUID da carona
 * @property {string} ownerId - UUID do criador
 * @property {string} ownerName - Nome do criador
 * @property {string} origin - Local de partida
 * @property {string} destination - Local de chegada
 * @property {string} time - Horário (HH:MM)
 * @property {number} totalSeats - Vagas totais
 * @property {number} seatsLeft - Vagas disponíveis
 * @property {string} contact - Telemóvel de contacto
 * @property {number} dayIndex - Índice dia semana (0-4)
 * @property {string[]} participants - Array de UUIDs de passageiros
 * @property {Date} createdAt - Data de criação
 */

/**
 * @typedef {Object} Message
 * @property {string} id - UUID da mensagem
 * @property {string} tripId - UUID da carona relacionada
 * @property {string} userId - UUID do remetente
 * @property {string} userName - Nome do remetente
 * @property {string} text - Conteúdo da mensagem
 * @property {Date} createdAt - Data de envio
 */

/**
 * @typedef {Object} Notification
 * @property {string} id - ID único
 * @property {string} text - Conteúdo
 * @property {number} ts - Timestamp
 * @property {boolean} read - Já foi lida?
 * @property {string[]} [forUsers] - UUIDs dos destinatários
 */

/**
 * @typedef {Object} AuthState
 * @property {User | null} currentUser - Utilizador autenticado
 * @property {boolean} isLoading - Carregamento em progresso?
 * @property {string} error - Mensagem de erro
 */

/**
 * @typedef {Object} TripsState
 * @property {Trip[]} trips - Lista de caronas
 * @property {boolean} isLoading - Carregamento em progresso?
 * @property {string} error - Mensagem de erro
 */

export {};
