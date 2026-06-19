window.APP = window.APP || {};

(function(APP) {
  let supabaseClient = null;

  APP.initAuthService = function(client) {
    supabaseClient = client;
  };

  APP.registerUser = async function(name, email, username, password) {
    if (!APP.isValidEmail(email)) {
      return { success: false, message: 'E-mail inválido.' };
    }
    if (!APP.isValidPassword(password)) {
      return { success: false, message: APP.MESSAGES.AUTH.PASSWORD_MIN_LENGTH };
    }

    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      return { success: false, message: APP.MESSAGES.AUTH.REGISTER_FAILED + authError.message };
    }

    const profileData = {
      id: authData.user.id,
      name: APP.normalizeString(name),
      email: email.trim().toLowerCase(),
      username: APP.normalizeString(username).toLowerCase(),
    };

    const { error: profileError } = await supabaseClient
      .from(APP.TABLES.PROFILES)
      .insert([profileData]);

    if (profileError) {
      return {
        success: false,
        message: APP.MESSAGES.AUTH.PROFILE_CREATION_FAILED + profileError.message,
      };
    }

    return {
      success: true,
      message: !authData.session
        ? APP.MESSAGES.AUTH.EMAIL_VERIFICATION_REQUIRED
        : 'Usuário registado com sucesso!',
      user: profileData,
      requiresEmailVerification: !authData.session,
    };
  };

  APP.loginUser = async function(email, password) {
    if (!email.trim() || !password) {
      return { success: false, message: APP.MESSAGES.AUTH.LOGIN_REQUIRED };
    }

    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError) {
      return {
        success: false,
        message:
          authError.message === 'Invalid login credentials'
            ? APP.MESSAGES.AUTH.INVALID_CREDENTIALS
            : APP.MESSAGES.AUTH.LOGIN_REQUIRED,
      };
    }

    const { data: profile } = await supabaseClient
      .from(APP.TABLES.PROFILES)
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (!profile) {
      return { success: false, message: APP.MESSAGES.AUTH.PROFILE_NOT_FOUND };
    }

    return {
      success: true,
      user: { id: authData.user.id, ...profile },
    };
  };

  APP.logoutUser = async function() {
    const { error } = await supabaseClient.auth.signOut();
    return { success: !error };
  };

  APP.sendPasswordRecovery = async function(email) {
    if (!APP.isValidEmail(email)) {
      return { success: false, message: 'E-mail inválido.' };
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email.trim().toLowerCase());

    if (error) {
      return { success: false, message: APP.MESSAGES.AUTH.PASSWORD_RECOVERY_FAILED + error.message };
    }

    return { success: true, message: APP.MESSAGES.AUTH.PASSWORD_RECOVERY_SENT };
  };

  APP.updateUserPassword = async function(newPassword) {
    if (!APP.isValidPassword(newPassword)) {
      return { success: false, message: APP.MESSAGES.AUTH.PASSWORD_MIN_LENGTH };
    }

    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });

    if (error) {
      return { success: false, message: APP.MESSAGES.AUTH.PASSWORD_UPDATE_FAILED + error.message };
    }

    return { success: true, message: APP.MESSAGES.AUTH.PASSWORD_UPDATE_SUCCESS };
  };

  APP.getSession = async function() {
    const { data } = await supabaseClient.auth.getSession();
    return data || {};
  };

  APP.loadUserProfile = async function(userId) {
    const { data: profile } = await supabaseClient
      .from(APP.TABLES.PROFILES)
      .select('*')
      .eq('id', userId)
      .single();

    return profile || null;
  };

  APP.onAuthStateChange = function(callback) {
    return supabaseClient.auth.onAuthStateChange(callback);
  };
})(window.APP);