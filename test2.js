var loginValues = require('./config.json');

const url = new URL(
    "https://osu.ppy.sh/oauth/token"
);

const headers = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
};

let body = "client_id=" + loginValues.client_id +
    "&client_secret=" + loginValues.client_secret +
    "&grant_type=" + loginValues.grant_type +
    "&scope=" + loginValues.scope;

async function getAPIkey() {
    return fetch(url, {
        method: "POST",
        headers,
        body: body,
    }).then(response => response.json().then(json => json['access_token']));
}

getAPIkey();