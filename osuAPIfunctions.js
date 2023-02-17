module.exports = {getAPIkey, lookupBeatmap, getBeatmapSetDisc}

async function getAPIkey() {
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
    return fetch(url, {
        method: "POST",
        headers,
        body: body,
    }).then(response => response.json().then(json => json['access_token']));
}

async function lookupBeatmap(api_key, id){
    const url = new URL(
        "https://osu.ppy.sh/api/v2/beatmaps/lookup"
    );
    
    const params = {
        "id": id,
    };
    Object.keys(params)
        .forEach(key => url.searchParams.append(key, params[key]));
    
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: 'Bearer ' + api_key
    };
    
    return fetch(url, {
        method: "GET",
        headers,
    }).then(response => response.json());
}

async function getBeatmapSetDisc(api_key, beatmapsetid){
    const url = new URL(
        "https://osu.ppy.sh/api/v2/beatmapsets/discussions"
    );
    
    const params = {
        "beatmapset_id": beatmapsetid
    };
    Object.keys(params)
        .forEach(key => url.searchParams.append(key, params[key]));
    
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",        
        Authorization: 'Bearer ' + api_key
    };
    
    return fetch(url, {
        method: "GET",
        headers,
    }).then(response => response.json().then(jsonresponse => jsonresponse['beatmaps']));
}