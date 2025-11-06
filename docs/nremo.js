import { createApiClient } from "./nremoapi.js";

export function getClient(token) {
  const api = createApiClient(token);

  const fetchMe = () => getMe(api);
  const fetchAppliances = () => getAppliances(api);
  const execute = (request) => post(api, request);

  return { fetchMe, fetchAppliances, execute };
}

async function getMe(api) {
  const data = await api.get("1/users/me");
  return data.nickname;
}

async function getAppliances(api) {
  const data = await api.get("1/appliances");
  return data.map(createAppliance);
}

async function post(api, request) {
  await api.post(request.path, request.body);
}

function createAppliance(payload) {
  const name = payload.device
    ? `${payload.device.name} - ${payload.nickname} (${payload.type})`
    : `${payload.nickname} (${payload.type})`;
  const applianceId = payload.id;
  const signals = payload.signals.map(createSignalButton);
  const lightButtons = payload.light ? payload.light.buttons.map((b) => createLightButton(applianceId, b)) : [];
  const tvButtons = payload.tv ? payload.tv.buttons.map((b) => createTvButton(applianceId, b)) : [];
  const buttons = [...signals, ...lightButtons, ...tvButtons];
  return { name, buttons };
}

function createSignalButton(signal) {
  const name = signal.name;
  const path = `1/signals/${signal.id}/send`
  const body = {};
  return { name, request: { path, body } };
}

function createLightButton(applianceId, button) {
  const name = button.label;
  const path = `1/appliances/${applianceId}/light`
  const body = `button=${button.name}`;
  return { name, request: { path, body } };
}

function createTvButton(applianceId, button) {
  const name = button.label;
  const path = `1/appliances/${applianceId}/tv`
  const body = `button=${button.name}`;
  return { name, request: { path, body } };
}
