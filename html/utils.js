const generateRandomString = (length) => {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
const generateCodeChallenge = async (verifier) => {
    const dig = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    return btoa(String.fromCharCode(...new Uint8Array(dig)))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
};

const $ = (id) => document.querySelector(`#${id}`);
const hide = (id) => {
    const elem = $(id);
    elem.classList.remove("visible");
    elem.classList.add("hidden");
};
const show = (id) => {
    const elem = $(id);
    elem.classList.remove("hidden");
    elem.classList.add("visible");
};

