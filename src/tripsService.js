/**
 * @file tripsService.js
 * Serviço centralizado de caronas
 * CRUD + lógica de adesão/desistência
 */

import { SUPABASE, TABLES, MESSAGES } from './constants.js';
import { validateTripData, normalizeString, calculateSeatsLeft } from './utils.js';

let supabaseClient = null;

/**
 * Inicializa cliente Supabase
 * @param {Object} client - Cliente Supabase
 */
export function initTripsService(client) {
  supabaseClient = client;
}

/**
 * Formata dados brutos da BD em Trip
 * @param {Object} rawTrip - Dados da BD
 * @returns {Object} Trip formatado
 * @private
 */
function formatTrip(rawTrip) {
  return {
    id: rawTrip.id,
    ownerId: rawTrip.owner_id,
    ownerName: rawTrip.owner_name,
    origin: rawTrip.origin,
    destination: rawTrip.destination,
    time: rawTrip.time,
    totalSeats: rawTrip.total_seats,
    seatsLeft: rawTrip.seats_left,
    contact: rawTrip.contact,
    dayIndex: rawTrip.day_index,
    participants: rawTrip.participants || [],
    createdAt: rawTrip.created_at,
  };
}

/**
 * Busca todas as caronas
 * @returns {Promise<{success: boolean, trips?: Array, message?: string}>}
 */
export async function fetchAllTrips() {
  const { data, error } = await supabaseClient
    .from(TABLES.TRIPS)
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return { success: false, message: MESSAGES.TRIPS.FETCH_FAILED + error.message };
  }

  const trips = data.map(formatTrip);
  return { success: true, trips };
}

/**
 * Busca caronas por dia
 * @param {number} dayIndex - 0-4
 * @returns {Promise<{success: boolean, trips?: Array}>}
 */
export async function fetchTripsByDay(dayIndex) {
  const { data, error } = await supabaseClient
    .from(TABLES.TRIPS)
    .select('*')
    .eq('day_index', dayIndex)
    .order('time', { ascending: true });

  if (error) {
    return { success: false, message: MESSAGES.TRIPS.FETCH_FAILED + error.message };
  }

  return { success: true, trips: data.map(formatTrip) };
}

/**
 * Cria nova carona
 * @param {Object} tripData - {origin, destination, time, totalSeats, contact}
 * @param {string} ownerId - UUID do criador
 * @param {string} ownerName - Nome do criador
 * @param {number} dayIndex - Índice do dia
 * @returns {Promise<{success: boolean, tripId?: string, message?: string}>}
 */
export async function createTrip(tripData, ownerId, ownerName, dayIndex) {
  // Validação
  const validation = validateTripData(tripData);
  if (!validation.valid) {
    return { success: false, message: 'Dados de carona inválidos.' };
  }

  const insertData = {
    owner_id: ownerId,
    owner_name: normalizeString(ownerName),
    origin: normalizeString(tripData.origin),
    destination: normalizeString(tripData.destination),
    time: tripData.time,
    total_seats: parseInt(tripData.totalSeats, 10),
    seats_left: parseInt(tripData.totalSeats, 10) - 1, // -1 para o dono
    contact: tripData.contact.trim(),
    day_index: dayIndex,
    participants: [ownerId], // Dono é automaticamente participante
  };

  const { data, error } = await supabaseClient
    .from(TABLES.TRIPS)
    .insert([insertData])
    .select();

  if (error) {
    return { success: false, message: MESSAGES.TRIPS.CREATE_FAILED + error.message };
  }

  return { success: true, tripId: data[0].id };
}

/**
 * Edita carona existente
 * @param {string} tripId - UUID da carona
 * @param {Object} tripData - Dados a atualizar
 * @param {number} currentOccupied - Número de participantes atuais
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function updateTrip(tripId, tripData, currentOccupied) {
  // Validação
  const validation = validateTripData(tripData);
  if (!validation.valid) {
    return { success: false, message: 'Dados de carona inválidos.' };
  }

  const newTotal = parseInt(tripData.totalSeats, 10);
  const newSeatsLeft = calculateSeatsLeft(newTotal, currentOccupied);

  const updateData = {
    origin: normalizeString(tripData.origin),
    destination: normalizeString(tripData.destination),
    time: tripData.time,
    total_seats: newTotal,
    seats_left: newSeatsLeft,
    contact: tripData.contact.trim(),
  };

  const { error } = await supabaseClient
    .from(TABLES.TRIPS)
    .update(updateData)
    .eq('id', tripId);

  if (error) {
    return { success: false, message: MESSAGES.TRIPS.EDIT_FAILED + error.message };
  }

  return { success: true };
}

/**
 * Deleta carona
 * @param {string} tripId - UUID
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function deleteTrip(tripId) {
  const { error } = await supabaseClient
    .from(TABLES.TRIPS)
    .delete()
    .eq('id', tripId);

  if (error) {
    return { success: false, message: MESSAGES.TRIPS.DELETE_FAILED + error.message };
  }

  return { success: true };
}

/**
 * Utilizador adere a carona
 * @param {string} tripId - UUID da carona
 * @param {string} userId - UUID do participante
 * @param {Array} currentParticipants - Lista atual de participants
 * @param {number} currentSeatsLeft - Vagas livres atuais
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function joinTrip(tripId, userId, currentParticipants, currentSeatsLeft) {
  // Validação: vagas livres?
  if (currentSeatsLeft <= 0) {
    return { success: false, message: 'Sem vagas disponíveis.' };
  }

  // Validação: já está participante?
  if (currentParticipants.includes(userId)) {
    return { success: false, message: 'Já está inscrito nesta carona.' };
  }

  const newParticipants = [...currentParticipants, userId];
  const newSeatsLeft = currentSeatsLeft - 1;

  const { error } = await supabaseClient
    .from(TABLES.TRIPS)
    .update({
      seats_left: newSeatsLeft,
      participants: newParticipants,
    })
    .eq('id', tripId);

  if (error) {
    return { success: false, message: MESSAGES.TRIPS.JOIN_FAILED + error.message };
  }

  return { success: true };
}

/**
 * Utilizador sai de carona
 * @param {string} tripId - UUID
 * @param {string} userId - UUID do participante
 * @param {Array} currentParticipants - Lista atual
 * @param {number} currentSeatsLeft - Vagas livres atuais
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function leaveTrip(tripId, userId, currentParticipants, currentSeatsLeft) {
  // Validação: é proprietário? (nunca deve sair da sua própria carona)
  // Esta validação é responsabilidade da UI, mas podemos adicionar aqui

  const newParticipants = currentParticipants.filter(id => id !== userId);
  const newSeatsLeft = currentSeatsLeft + 1;

  const { error } = await supabaseClient
    .from(TABLES.TRIPS)
    .update({
      seats_left: newSeatsLeft,
      participants: newParticipants,
    })
    .eq('id', tripId);

  if (error) {
    return { success: false, message: MESSAGES.TRIPS.LEAVE_FAILED + error.message };
  }

  return { success: true };
}

/**
 * Listener para mudanças em caronas (realtime)
 * @param {Function} callback - (event, payload) => void
 * @returns {Object} Channel subscription
 */
export function subscribeToTripsChanges(callback) {
  return supabaseClient
    .channel('trips-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLES.TRIPS },
      (payload) => callback(payload.eventType, payload)
    )
    .subscribe();
}
