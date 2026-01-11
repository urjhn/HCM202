// Simple utility for countapi.xyz
const NAMESPACE = 'hcm202_project_v1';
// Switching to counterapi.dev as countapi.xyz is down
const API_URL = 'https://api.counterapi.dev/v1';

// Mock helper: Only used if API completely fails, and starts from 0 (no fake data)
const getMockParams = (key) => {
  // CHANGED KEY PREFIX to invalidate old random "fake" data
  const storeKey = `real_count_${key}`;
  let val = parseInt(localStorage.getItem(storeKey) || '0');
  // No random generation - Real numbers start at 0!
  return val;
};

const incrementMock = (key) => {
  const storeKey = `real_count_${key}`;
  let val = getMockParams(key);
  val++;
  localStorage.setItem(storeKey, val);
  return val;
};

// Helper to handle CounterAPI response format
const handleResponse = async (res) => {
  if (!res.ok) throw new Error('API Error');
  const data = await res.json();
  // CounterAPI returns 'count', simple-count-api returns 'count', countapi.xyz returned 'value'
  return data.count || data.value || 0;
};

export const trackVisit = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    // CounterAPI: /v1/{namespace}/{key}/up
    const response = await fetch(`${API_URL}/${NAMESPACE}/visits/up`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return handleResponse(response);
  } catch (error) {
    console.warn('Tracking API failed, falling back:', error);
    return incrementMock('visits'); // Fallback if still fails
  }
};

export const getVisits = async () => {
  try {
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 5000);
     // CounterAPI: /v1/{namespace}/{key}/
     const response = await fetch(`${API_URL}/${NAMESPACE}/visits/`, { signal: controller.signal });
     clearTimeout(timeoutId);
     return handleResponse(response);
  } catch (error) {
     return getMockParams('visits');
  }
};

export const trackEvent = async (eventKey) => {
  try {
    // Sanitize key for URL (replace _ with - if needed, but usually fine)
    const response = await fetch(`${API_URL}/${NAMESPACE}/${eventKey}/up`);
    return handleResponse(response);
  } catch (error) {
    return incrementMock(eventKey);
  }
};

export const getAllStats = async () => {
  try {
    const keys = ['visits', '3d_view', 'quiz_start', 'ai_query'];
    const requests = keys.map(key => 
      fetch(`${API_URL}/${NAMESPACE}/${key}/`) // Get current count
        .then(res => res.json())
        .then(data => ({ key, value: data.count || 0 }))
        .catch(() => ({ key, value: null }))
    );
    
    const results = await Promise.all(requests);
    const stats = {};
    
    results.forEach(res => {
      stats[res.key] = res.value !== null ? res.value : getMockParams(res.key);
    });
    
    return {
      visits: stats.visits,
      views3d: stats['3d_view'],
      quizStarts: stats.quiz_start,
      aiQueries: stats.ai_query,
    };
  } catch (error) {
    return { 
      visits: getMockParams('visits'), 
      views3d: getMockParams('3d_view'), 
      quizStarts: getMockParams('quiz_start'), 
      aiQueries: getMockParams('ai_query') 
    };
  }
};
