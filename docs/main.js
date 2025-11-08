import { getClient } from "./nremo.js";

// localStorage キー
const LS_ACCESS_TOKEN = "tool:natureapiaccesstoken";

// 要素参照
const tokenEl = document.getElementById("apiAccessToken");
const scanBtn = document.getElementById("scanBtn");
const spinner = document.getElementById("spinner");
const alertEl = document.getElementById("alert");
const alertMsg = document.getElementById("alertMsg");
const appliancesEl = document.getElementById("appliancesList");
const userInfoEl = document.getElementById("userInfo");

scanBtn.addEventListener("click", scanUserInfo);

tokenEl.addEventListener("sl-input", () => {
    displayUserInfo("", []);
    if (tokenEl.value.length > 0) {
        scanBtn.disabled = false;
    } else {
        scanBtn.disabled = true;
        localStorage.removeItem(LS_ACCESS_TOKEN);
    }
});

initialize();

async function initialize() {
    setBusy(false);
    hideError();
    const savedToken = localStorage.getItem(LS_ACCESS_TOKEN);
    if (savedToken) {
        tokenEl.value = savedToken;
        await scanUserInfo();
    }
}

// UIヘルパ
function setBusy(b) {
    document.querySelectorAll("sl-button").forEach(btn => btn.disabled = b);
    spinner.classList.toggle("loading", b);
}
function showError(msg) {
    alertMsg.textContent = msg ?? "";
    alertEl.show();
}
function hideError() {
    alertEl.hide();
}
function withSpinner(asyncFunc) {
    return async () => {

        setBusy(true);
        hideError();

        try {
            await asyncFunc();

        } catch (e) {
            console.error(e);
            showError(e.message);

        } finally {
            setBusy(false);
        }
    }
}

async function scanUserInfo() {
    const scan = async () => {
        const token = tokenEl.value.trim();
        const client = getClient(token);
        const nickname = await client.fetchMe();
        const appliances = await client.fetchAppliances();
        displayUserInfo(`${nickname}さん`, appliances);
        localStorage.setItem(LS_ACCESS_TOKEN, token);
    }
    await withSpinner(scan)();
}


function createApplianceCard(appliance) {
    const card = document.createElement("sl-card");
    const header = document.createElement("div");
    header.slot = "header";
    header.textContent = appliance.name;

    const buttonsGrid = document.createElement("div");
    buttonsGrid.className = "buttons-grid";

    appliance.buttons.forEach(button => {
        buttonsGrid.appendChild(createButtonElement(button));
    });

    card.appendChild(header);
    card.appendChild(buttonsGrid);
    return card;
}

function createButtonElement(button) {
    const buttonEl = document.createElement("sl-button");
    buttonEl.textContent = button.name;
    buttonEl.addEventListener("click", withSpinner(button.push));
    return buttonEl;
}

function displayUserInfo(userName, appliances) {
    userInfoEl.textContent = userName;
    appliancesEl.innerHTML = "";
    appliances.forEach(appliance => {
        appliancesEl.appendChild(createApplianceCard(appliance));
    });
}
