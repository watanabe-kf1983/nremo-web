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


// 名前をスキャン
async function scanUserInfo() {
    hideError();
    setBusy(true);

    try {
        const token = tokenEl.value.trim();
        const client = getClient(token);
        const nickname = await client.fetchMe();
        const appliances = await client.fetchAppliances();
        displayUserInfo(`${nickname}さん`, appliances);
        localStorage.setItem(LS_ACCESS_TOKEN, token);

    } catch (e) {
        console.error(e);
        showError(e.message);

    } finally {
        setBusy(false);
    }
}

async function handleButtonPress(button) {
    hideError();
    setBusy(true);

    try {
        const client = getClient(tokenEl.value.trim());
        const request = JSON.parse(button.dataset.request);
        await client.execute(request);

    } catch (e) {
        console.error(e);
        showError(e.message);
    } finally {
        setBusy(false);
    }
}


function createButtonElement(button) {
    const buttonEl = document.createElement("sl-button");
    buttonEl.textContent = button.name;
    buttonEl.dataset.request = JSON.stringify(button.request);
    buttonEl.addEventListener("click", () => handleButtonPress(buttonEl));
    return buttonEl;
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

function displayUserInfo(userName, appliances) {
    userInfoEl.textContent = userName;
    appliancesEl.innerHTML = ""; 
    appliances.forEach(appliance => {
        appliancesEl.appendChild(createApplianceCard(appliance));
    });
}

