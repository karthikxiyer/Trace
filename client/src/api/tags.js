import { API_BASE } from './base';

const BASE = `${API_BASE}/api/tags`;

export async function getTags(token) {
  const res = await fetch(BASE, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch tags');
  return data;
}

export async function createTag(token, name, color) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, color }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create tag');
  return data;
}

export async function deleteTag(token, id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete tag');
  return data;
}

export async function addTagToLink(token, tagId, linkId) {
  const res = await fetch(`${BASE}/${tagId}/links/${linkId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add tag');
  return data;
}

export async function removeTagFromLink(token, tagId, linkId) {
  const res = await fetch(`${BASE}/${tagId}/links/${linkId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to remove tag');
  return data;
}
