window.APP = window.APP || {};

(function(APP) {
  let supabaseClient = null;

  APP.initTripsService = function(client) {
    supabaseClient = client;
  };

  APP.fetchTrips = async function(dayIndex = null) {
    let query = supabaseClient.from(APP.TABLES.TRIPS).select('*').order('created_at', { ascending: true });

    if (dayIndex !== null) {
      query = query.eq('day_index', dayIndex);
    }

    const { data, error } = await query;
    return { data: data || [], error };
  };

  APP.createTrip = async function(tripData) {
    const { error } = await supabaseClient.from(APP.TABLES.TRIPS).insert([tripData]);
    return { success: !error, error };
  };

  APP.updateTrip = async function(tripId, updates) {
    const { error } = await supabaseClient
      .from(APP.TABLES.TRIPS)
      .update(updates)
      .eq('id', tripId);
    return { success: !error, error };
  };

  APP.deleteTrip = async function(tripId) {
    const { error } = await supabaseClient
      .from(APP.TABLES.TRIPS)
      .delete()
      .eq('id', tripId);
    return { success: !error, error };
  };

  APP.joinTrip = async function(tripId, userId) {
    const trip = await supabaseClient
      .from(APP.TABLES.TRIPS)
      .select('*')
      .eq('id', tripId)
      .single();

    if (!trip.data) return { success: false };

    const updated = {
      seats_left: trip.data.seats_left - 1,
      participants: [...(trip.data.participants || []), userId],
    };

    return APP.updateTrip(tripId, updated);
  };

  APP.leaveTrip = async function(tripId, userId) {
    const trip = await supabaseClient
      .from(APP.TABLES.TRIPS)
      .select('*')
      .eq('id', tripId)
      .single();

    if (!trip.data) return { success: false };

    const updated = {
      seats_left: trip.data.seats_left + 1,
      participants: (trip.data.participants || []).filter(id => id !== userId),
    };

    return APP.updateTrip(tripId, updated);
  };
})(window.APP);