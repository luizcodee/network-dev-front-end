import { api } from './api';
import { Platform } from 'react-native';

export async function getPosts(page = 0, size = 20) {
  const response = await api.get(`/posts?page=${page}&size=${size}&sort=createdAt,desc`);
  return response.data;
}

export async function createPost(userId: number, description: string) {
  const response = await api.post('/posts', { userId, description, imageUrl: null });
  return response.data;
}

export async function createPostWithImage(userId: number | string, description: string, imageUri: string) {
  const formData: any = new FormData();
  const filename = imageUri.split('/').pop() || 'post.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  let filePayload: any;
  if (Platform.OS === 'web') {
    const blob = await fetch(imageUri).then((res) => res.blob());
    filePayload = new File([blob], filename, { type });
  } else {
    filePayload = { uri: imageUri, name: filename, type };
  }

  formData.append('userId', userId.toString());
  formData.append('description', description);
  formData.append('image', filePayload);

  const response = await api.post('/posts/create-with-image', formData);
  return response.data;
}

export async function deletePost(postId: number) {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
}

export async function toggleLike(postId: number, userId: number) {
  const response = await api.post(`/posts/${postId}/like`, null, { params: { userId } });
  return response.data;
}

export async function getLikesCount(postId: number) {
  const response = await api.get(`/posts/${postId}/likes/count`);
  return response.data;
}

export async function checkLiked(postId: number, userId: number) {
  const response = await api.get(`/posts/${postId}/likes/check`, { params: { userId } });
  return response.data;
}

export async function getComments(postId: number) {
  const response = await api.get(`/posts/${postId}/comments`);
  return response.data;
}

export async function addComment(postId: number, userId: number, text: string) {
  const response = await api.post(`/posts/${postId}/comments`, null, {
    params: { userId, text },
  });
  return response.data;
}

export async function deleteComment(commentId: number) {
  const response = await api.delete(`/posts/comments/${commentId}`);
  return response.data;
}
