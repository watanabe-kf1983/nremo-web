import { createApiClient } from "./nremoapi.js";

export function getClient(token) {
  const api = createApiClient(token);
  const fetchMe = () => getMe(api);
  const fetchAppliances = () => getAppliances(api);

  return { fetchMe, fetchAppliances };
}

async function getMe(api) {
  const data = await api.get("1/users/me");
  return data.nickname;
}

async function getAppliances(api) {
  const data = await api.get("1/appliances");
  return data.map((payload) => createAppliance(api, payload));
}

function createAppliance(api, payload) {
  const name = payload.device
    ? `${payload.device.name} - ${payload.nickname} (${payload.type})`
    : `${payload.nickname} (${payload.type})`;
  const applianceId = payload.id;
  const signals = payload.signals.map((s) => createSignalButton(api, s));
  const lightButtons = payload.light ? payload.light.buttons.map((b) => createLightButton(api, applianceId, b)) : [];
  const tvButtons = payload.tv ? payload.tv.buttons.map((b) => createTvButton(api, applianceId, b)) : [];
  const buttons = [...signals, ...lightButtons, ...tvButtons];
  return { name, buttons };
}

function createSignalButton(api, signal) {
  const name = signal.name;
  const push = () => api.post(`1/signals/${signal.id}/send`, {});
  return { name, push };
}

function createLightButton(api, applianceId, button) {
  const name = button.label;
  const push = () => api.post(`1/appliances/${applianceId}/light`, `button=${button.name}`);
  return { name, push };
}

function createTvButton(api, applianceId, button) {
  const name = button.label;
  const push = () => api.post(`1/appliances/${applianceId}/tv`, `button=${button.name}`);
  return { name, push };
}
