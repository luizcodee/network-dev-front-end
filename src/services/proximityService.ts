import { api } from './api';

export async function getNearbyUsers(userId: number) {
  const response = await api.get('/proximity/nearby', { params: { userId } });
  return response.data;
}

export async function getProximityHistory(userId: number) {
  const response = await api.get('/proximity/history', { params: { userId } });
  return response.data;
}

export async function registerDetection(originUserId: number, detectedUserId: number, rssi: number) {
  const response = await api.post('/proximity/detect', {
    originUserId,
    detectedUserId,
    rssi,
    timestamp: new Date().toISOString(),
  });
  return response.data;
}

export function rssiToDistance(rssi: number): number {
  const txPower = -59;
  const n = 2;
  return Math.pow(10, (txPower - rssi) / (10 * n));
}
