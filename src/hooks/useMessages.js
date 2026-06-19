/**
 * @file hooks/useMessages.js
 * Custom Hook: Mensagens de Chat
 * 
 * Encapsula: fetch, send, realtime listener
 * Estado: messages[], loading, error
 */

const { useState, useEffect, useRef, useCallback } = React;
import { 
  fetchMessagesByTrip, 
  sendMessage, 
  subscribeToMessages 
} from '../messagesService.js';

export function useMessages(supabaseClient, userId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const subscriptionRef = useRef(null);

  // Carregar mensagens quando trip muda
  const loadMessages = useCallback(async (tripId) => {
    if (!tripId) return;
    
    setLoading(true);
    setError('');
    
    // Limpar subscription anterior
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    const result = await fetchMessagesByTrip(tripId);
    if (result.success) {
      setMessages(result.messages);
    } else {
      setError(result.message);
    }

    // Nova subscription para realtime
    subscriptionRef.current = subscribeToMessages((newMsg) => {
      if (newMsg.trip_id === tripId) {
        setMessages(prev => [...prev, newMsg]);
      }
    });

    setLoading(false);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  // Enviar mensagem
  const handleSend = useCallback(async (tripId, text, userName) => {
    setError('');
    const result = await sendMessage(tripId, userId, userName, text);
    
    if (!result.success) {
      setError(result.message);
    }
    
    return result;
  }, [userId]);

  return {
    // Estado
    messages,
    loading,
    error,

    // Métodos
    loadMessages,
    send: handleSend,
    setError,
  };
}

