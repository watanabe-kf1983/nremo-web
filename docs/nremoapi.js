import axios from "axios";

export function createApiClient(token) {

  const ax = axios.create({
    baseURL: 'https://api.nature.global/',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const get = (path, params) => _get(ax, path, params);
  const post = (path, body) => _post(ax, path, body);

  return { get, post };
}

async function _get(ax, path, params) {
  const res = await ax.get(path, { params });
  return res.data;
}

async function _post(ax, path, body) {
  const res = await ax.post(path, body);
  return res.data;
}
