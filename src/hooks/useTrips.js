
/**
 * @file hooks/useTrips.js
 * Custom Hook: Caronas
 * 
 * Encapsula: fetch, create, edit, delete, join, leave
 * Estado: trips[], selectedDay, loading, error
 * Realtime: escuta mudanças em tempo real
 */

const { useState, useEffect, useMemo, useCallback } = React;
import { 
  fetchAllTrips, 
  createTrip, 
  updateTrip, 
  deleteTrip, 
  joinTrip, 
  leaveTrip,
  subscribeToTripsChanges 
} from '../tripsService.js';
import { filterAndSortTripsByDay } from '../utils.js';

export function useTrips(supabaseClient, userId) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);

  // Filtrar trips por dia selecionado
  const dayTrips = useMemo(() => 
    filterAndSortTripsByDay(trips, selectedDay), 
    [trips, selectedDay]
  );

  // Carregar caronas ao montar
  useEffect(() => {
    if (!supabaseClient) return;
    
    async function loadTrips() {
      setLoading(true);
      setError('');
      const result = await fetchAllTrips();
      if (result.success) {
        setTrips(result.trips);
      } else {
        setError(result.message);
      }
      setLoading(false);
    }

    loadTrips();

    // Realtime listener
    const channel = subscribeToTripsChanges((eventType, payload) => {
      if (eventType === 'INSERT') {
        setTrips(prev => [...prev, payload.new]);
      } else if (eventType === 'UPDATE') {
        setTrips(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
      } else if (eventType === 'DELETE') {
        setTrips(prev => prev.filter(t => t.id !== payload.old.id));
      }
    });

    return () => supabaseClient.removeChannel(channel);
  }, [supabaseClient]);

  // Criar nova carona
  const handleCreate = useCallback(async (tripData, dayIndex) => {
    setLoading(true);
    setError('');
    const result = await createTrip(tripData, userId, 'User Name', dayIndex);
    setLoading(false);
    
    if (!result.success) {
      setError(result.message);
    }
    return result;
  }, [userId]);

  // Editar carona
  const handleEdit = useCallback(async (tripId, tripData) => {
    setLoading(true);
    setError('');
    const trip = trips.find(t => t.id === tripId);
    const occupied = trip.totalSeats - trip.seatsLeft;
    
    const result = await updateTrip(tripId, tripData, occupied);
    setLoading(false);
    
    if (!result.success) {
      setError(result.message);
    }
    return result;
  }, [trips]);

  // Deletar carona
  const handleDelete = useCallback(async (tripId) => {
    setLoading(true);
    setError('');
    const result = await deleteTrip(tripId);
    setLoading(false);
    
    if (!result.success) {
      setError(result.message);
    }
    return result;
  }, []);

  // Aderir a carona
  const handleJoin = useCallback(async (tripId) => {
    setLoading(true);
    setError('');
    const trip = trips.find(t => t.id === tripId);
    
    if (!trip) {
      setError('Carona não encontrada.');
      setLoading(false);
      return { success: false };
    }
    
    const result = await joinTrip(
      tripId, 
      userId, 
      trip.participants, 
      trip.seatsLeft
    );
    setLoading(false);
    
    if (!result.success) {
      setError(result.message);
    }
    return result;
  }, [trips, userId]);

  // Sair de carona
  const handleLeave = useCallback(async (tripId) => {
    setLoading(true);
    setError('');
    const trip = trips.find(t => t.id === tripId);
    
    if (!trip) {
      setError('Carona não encontrada.');
      setLoading(false);
      return { success: false };
    }
    
    const result = await leaveTrip(
      tripId, 
      userId, 
      trip.participants, 
      trip.seatsLeft
    );
    setLoading(false);
    
    if (!result.success) {
      setError(result.message);
    }
    return result;
  }, [trips, userId]);

  return {
    // Estado
    trips,
    dayTrips,
    selectedDay,
    loading,
    error,

    // Setters
    setSelectedDay,
    setError,

    // Métodos
    create: handleCreate,
    edit: handleEdit,
    delete: handleDelete,
    join: handleJoin,
    leave: handleLeave,
  };
}