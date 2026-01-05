import { apiConfig } from './config';
import { fetchAuthSession } from 'aws-amplify/auth';

async function getAuthToken() {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

export async function createTrip(tripData) {
  const token = await getAuthToken();
  
  const response = await fetch(`${apiConfig.endpoint}/trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token || ''
    },
    body: JSON.stringify(tripData)
  });
  
  return response.json();
}

export async function getUserTrips(userId) {
  const token = await getAuthToken();
  
  const response = await fetch(`${apiConfig.endpoint}/trips/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': token || ''
    }
  });
  
  return response.json();
}

export async function deleteTrip(userId, tripId) {
  const token = await getAuthToken();
  
  const response = await fetch(`${apiConfig.endpoint}/trips/${userId}/${tripId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token || ''
    }
  });
  
  return response.json();
}
