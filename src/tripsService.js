window.APP = window.APP || {};

(function(APP) {
  let supabaseClient = null;

  function ensureInitialized() {
    if (!supabaseClient) {
      throw new Error('tripsService não foi inicializado. Chame APP.initTripsService(client) antes de usar.');
    }
  }

  APP.initTripsService = function(client) {
    supabaseClient = client;
  };

  // Converte registo do Supabase (snake_case) para o formato usado pelos componentes (camelCase)
  function toCamelTrip(t) {
    if (!t) return null;
    return {
      id: t.id,
      ownerId: t.owner_id,
      ownerName: t.owner_name,
      origin: t.origin,
      destination: t.destination,
      time: t.time,
      totalSeats: t.total_seats,
      seatsLeft: t.seats_left,
      contact: t.contact,
      dayIndex: t.day_index,
      participants: t.participants || [],
      createdAt: t.created_at,
    };
  }

  APP.fetchAllTrips = async function(dayIndex = null) {
    ensureInitialized();
    let query = supabaseClient.from(APP.TABLES.TRIPS).select('*').order('created_at', { ascending: true });

    if (dayIndex !== null) {
      query = query.eq('day_index', dayIndex);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, trips: [], message: 'Erro ao buscar caronas: ' + error.message };
    }

    return { success: true, trips: (data || []).map(toCamelTrip) };
  };

  APP.createTrip = async function(tripData, ownerId, ownerName, dayIndex) {
    ensureInitialized();
    const insertData = {
      owner_id: ownerId,
      owner_name: ownerName,
      origin: tripData.origin,
      destination: tripData.destination,
      time: tripData.time,
      total_seats: tripData.totalSeats,
      seats_left: tripData.seatsLeft,
      contact: tripData.contact,
      day_index: dayIndex,
      participants: [ownerId],
    };

    const { error } = await supabaseClient.from(APP.TABLES.TRIPS).insert([insertData]);

    if (error) {
      return { success: false, message: 'Erro ao salvar carona: ' + error.message };
    }

    return { success: true };
  };

  APP.updateTrip = async function(tripId, tripData, occupied = 0) {
    ensureInitialized();
    let newLeft = tripData.totalSeats - occupied;
    if (newLeft < 0) newLeft = 0;

    const updateData = {
      origin: tripData.origin,
      destination: tripData.destination,
      time: tripData.time,
      total_seats: tripData.totalSeats,
      seats_left: newLeft,
      contact: tripData.contact,
    };

    const { error } = await supabaseClient
      .from(APP.TABLES.TRIPS)
      .update(updateData)
      .eq('id', tripId);

    if (error) {
      return { success: false, message: 'Erro ao editar carona: ' + error.message };
    }

    return { success: true };
  };

  APP.deleteTrip = async function(tripId) {
    ensureInitialized();
    const { error } = await supabaseClient
      .from(APP.TABLES.TRIPS)
      .delete()
      .eq('id', tripId);

    if (error) {
      return { success: false, message: 'Erro ao deletar: ' + error.message };
    }

    return { success: true };
  };

  APP.joinTrip = async function(tripId, userId, currentParticipants, currentSeatsLeft) {
    ensureInitialized();
    const { error } = await supabaseClient
      .from(APP.TABLES.TRIPS)
      .update({
        seats_left: currentSeatsLeft - 1,
        participants: [...(currentParticipants || []), userId],
      })
      .eq('id', tripId);

    if (error) {
      return { success: false, message: 'Erro ao entrar: ' + error.message };
    }

    return { success: true };
  };

  APP.leaveTrip = async function(tripId, userId, currentParticipants, currentSeatsLeft) {
    ensureInitialized();
    const { error } = await supabaseClient
      .from(APP.TABLES.TRIPS)
      .update({
        seats_left: currentSeatsLeft + 1,
        participants: (currentParticipants || []).filter(id => id !== userId),
      })
      .eq('id', tripId);

    if (error) {
      return { success: false, message: 'Erro ao sair: ' + error.message };
    }

    return { success: true };
  };

  APP.subscribeToTripsChanges = function(callback) {
    ensureInitialized();
    const channel = supabaseClient
      .channel('trips-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, (payload) => {
        const newTrip = payload.new && Object.keys(payload.new).length ? toCamelTrip(payload.new) : null;
        const oldTrip = payload.old && Object.keys(payload.old).length ? toCamelTrip(payload.old) : null;
        callback(payload.eventType, { new: newTrip, old: oldTrip });
      })
      .subscribe();

    return channel;
  };
})(window.APP);