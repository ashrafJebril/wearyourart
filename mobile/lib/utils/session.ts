import AsyncStorage from '@react-native-async-storage/async-storage'

const SESSION_KEY = 'wearyourart-session-id'

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export async function getSessionId(): Promise<string> {
  try {
    let sessionId = await AsyncStorage.getItem(SESSION_KEY)

    if (!sessionId) {
      sessionId = generateSessionId()
      await AsyncStorage.setItem(SESSION_KEY, sessionId)
    }

    return sessionId
  } catch (error) {
    // Fallback to a new session if storage fails
    return generateSessionId()
  }
}

export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY)
  } catch (error) {
    console.error('Failed to clear session:', error)
  }
}
