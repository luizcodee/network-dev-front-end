import { api } from './api';

export async function createConnection(user1Id: number, user2Id: number) {
  const response = await api.post('/connections', { user1Id, user2Id });
  return response.data;
}

export async function getConnections(userId: number) {
  const response = await api.get('/connections', { params: { userId } });
  return response.data;
}

export async function deleteConnection(connectionId: number) {
  const response = await api.delete(`/connections/${connectionId}`);
  return response.data;
}

export async function getUserPosts(userId: number) {
  const response = await api.get(`/users/${userId}/posts`);
  return response.data;
}
