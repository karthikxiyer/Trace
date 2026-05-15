import { API_BASE } from './base';

const BASE = `${API_BASE}/api/links`;

export async function getLinks(token, page = 0, filters = {}) {
  const params = new URLSearchParams({ page, ...filters });
  const res = await fetch(`${BASE}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch links');
  return data;
}

export async function saveLink(token, url) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save link');
  return data;
}

export async function updateLink(token, id, fields) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(fields),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update link');
  return data;
}

export async function deleteLink(token, id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete link');
  return data;
}

export async function searchLinks(token, q) {
  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Search failed');
  return data;
}

export async function getLinkContent(token, id) {
  const res = await fetch(`${BASE}/${id}/content`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch content');
  return data;
}

export async function getNotes(token, linkId) {
  const res = await fetch(`${BASE}/${linkId}/notes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch notes');
  return data;
}

export async function addNote(token, linkId, content) {
  const res = await fetch(`${BASE}/${linkId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add note');
  return data;
}
