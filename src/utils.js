/**
 * @file utils.js
 * Funções utilitárias: formatting, validação, helpers
 */

import { COLORS, LIMITS, WEEKDAYS } from './constants.js';

// ═══════════════════════════════════════════════════════════════
// FORMATTING
// ═══════════════════════════════════════════════════════════════

/**
 * Formata timestamp para hora legível (HH:MM)
 * @param {number | Date} ts - Timestamp ou objeto Date
 * @returns {string} Hora formatada
 */
export function formatTime(ts) {
  const date = typeof ts === 'number' ? new Date(ts) : ts;
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Extrai iniciais de um nome para avatar
 * @param {string} name - Nome completo
 * @returns {string} Duas letras maiúsculas
 */
export function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Gera cor consistente baseada num string
 * @param {string} str - String para hash (nome do utilizador)
 * @returns {string} Cor hex
 */
export function getAvatarColor(str) {
  const palette = [
    '#5c6bc0', '#26a69a', '#ef5350', '#ab47bc', '#42a5f5',
    '#66bb6a', '#ffa726'
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

/**
 * Calcula a cor da barra de ocupação (vermelha/laranja/verde)
 * @param {number} occupancyPercent - Percentagem de ocupação (0-100)
 * @returns {string} Cor hex
 */
export function getOccupancyColor(occupancyPercent) {
  if (occupancyPercent > 66) return COLORS.success;
  if (occupancyPercent > 33) return COLORS.warning;
  return COLORS.danger;
}

/**
 * Formata múltiplos espaços/quebras em strings de entrada
 * @param {string} str - String a limpar
 * @returns {string} String limpa
 */
export function normalizeString(str) {
  return str.trim().replace(/\s+/g, ' ');
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Valida formato de e-mail
 * @param {string} email - E-mail a validar
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida comprimento de senha
 * @param {string} password - Senha
 * @returns {boolean}
 */
export function isValidPassword(password) {
  return password.length >= LIMITS.MIN_PASSWORD_LENGTH;
}

/**
 * Valida campo de texto obrigatório
 * @param {string} text - Texto a validar
 * @returns {boolean}
 */
export function isValidText(text) {
  return normalizeString(text).length > 0;
}

/**
 * Valida número de vagas
 * @param {number} seats - Número de vagas
 * @returns {boolean}
 */
export function isValidSeats(seats) {
  const num = parseInt(seats, 10);
  return num >= LIMITS.MIN_SEATS && num <= LIMITS.MAX_SEATS;
}

/**
 * Valida formato de hora (HH:MM)
 * @param {string} time - Hora
 * @returns {boolean}
 */
export function isValidTime(time) {
  return /^\d{2}:\d{2}$/.test(time);
}

/**
 * Valida número de telemóvel (formato básico)
 * @param {string} phone - Número
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  return /^\d{9,15}$/.test(phone.replace(/\D/g, ''));
}

/**
 * Validação completa de criação/edição de carona
 * @param {Object} data - Dados da carona
 * @returns {{valid: boolean, errors: Object}}
 */
export function validateTripData(data) {
  const errors = {};

  if (!isValidText(data.origin)) errors.origin = 'Local de partida obrigatório.';
  if (!isValidText(data.destination)) errors.destination = 'Local de chegada obrigatório.';
  if (!isValidTime(data.time)) errors.time = 'Horário inválido.';
  if (!isValidSeats(data.totalSeats)) errors.totalSeats = `Vagas entre ${LIMITS.MIN_SEATS} e ${LIMITS.MAX_SEATS}.`;
  if (!isValidPhone(data.contact)) errors.contact = 'Telemóvel inválido.';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ═══════════════════════════════════════════════════════════════
// HELPERS - DATAS & SEMANAS
// ═══════════════════════════════════════════════════════════════

/**
 * Obtém as datas de segunda a sexta da semana atual
 * @returns {Date[]} Array com 5 datas
 */
export function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  // Ajusta offset: 0 = Domingo (usar segunda), 1-5 = Segunda-Sexta
  const offset = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + offset);

  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/**
 * Obtém índice do dia atual (0-4) ou 0 se fim de semana
 * @returns {number}
 */
export function getTodayIndex() {
  const day = new Date().getDay();
  return day === 0 || day === 6 ? 0 : day - 1;
}

/**
 * Obtém timestamp atual
 * @returns {number}
 */
export function nowTimestamp() {
  return Date.now();
}

// ═══════════════════════════════════════════════════════════════
// HELPERS - ARRAYS & OBJETOS
// ═══════════════════════════════════════════════════════════════

/**
 * Calcula vagas livres após mudança de total de vagas
 * @param {number} newTotal - Novo total de vagas
 * @param {number} currentOccupied - Vagas ocupadas atualmente
 * @returns {number} Vagas livres (mínimo 0)
 */
export function calculateSeatsLeft(newTotal, currentOccupied) {
  const left = newTotal - currentOccupied;
  return Math.max(0, left);
}

/**
 * Filtra trips por dia
 * @param {Array} trips - Lista de trips
 * @param {number} dayIndex - Índice do dia (0-4)
 * @returns {Array} Trips filtrados e ordenados por hora
 */
export function filterAndSortTripsByDay(trips, dayIndex) {
  return trips
    .filter(trip => trip.dayIndex === dayIndex)
    .sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Retorna perfil de participante a partir da lista de users
 * @param {string} userId - UUID do utilizador
 * @param {Array} users - Lista de profiles
 * @returns {Object | null}
 */
export function getUserProfile(userId, users) {
  return users?.find(u => u.id === userId) || null;
}

/**
 * Retorna lista de perfis de participantes
 * @param {string[]} participantIds - UUIDs dos participantes
 * @param {Array} users - Lista completa de profiles
 * @returns {Array} Perfis encontrados
 */
export function getParticipantProfiles(participantIds, users) {
  return participantIds
    .map(id => getUserProfile(id, users))
    .filter(Boolean);
}
