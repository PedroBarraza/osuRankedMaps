var fs = require('fs');
var osuAPI = require('./osuAPIfunctions.js');
var api_key = '';

async function returnFetchResponse(fetchLink) {
    return fetch(fetchLink, {
        headers: {
            'Accept': 'application/json'
        }
    })
};

async function get2023beatmaps(fetchLink) {
    let response = await returnFetchResponse(fetchLink);
    let responseString = await response.text();
    let JSONresponse = JSON.parse(responseString);
    return {
        result_count: JSONresponse['result_count'],
        beatmaps: JSONresponse['beatmaps']
    };
}

async function writeBeatmapCSV(cleanInput) {
    writeStream = fs.createWriteStream('beatmaps.csv', { 'flags': 'a' });
    writeStream.write(cleanInput);
    return;
}

async function writeDifficultiesCSV(cleanInput) {
    writeStream = fs.createWriteStream('beatmapDiffs.csv', { 'flags': 'a' });
    writeStream.write(cleanInput);
    return;
}

async function iteratesThroughDifficulties(beatmapDiffs) {
    let inputString = '';
    let diffs = [];
    for (i = 0; i < beatmapDiffs.length; i++) {
        let beatmap = await osuAPI.lookupBeatmap(api_key, beatmapDiffs[i]);
        let diffObject = {
            'url': beatmap['url'],
            'artist': beatmap['beatmapset']['artist'],
            'title': beatmap['beatmapset']['title'],
            'version': beatmap['version'],
            'SR': beatmap['difficulty_rating'],
            'AR': beatmap['ar'],
            'OD': beatmap['accuracy'],
            'CS': beatmap['cs'],
            'HP': beatmap['drain'],
            'Circle Count': beatmap['count_circles'],
            'Slider Count': beatmap['count_sliders'],
            'Spinner Count': beatmap['count_spinners']
        }
        diffs.push(diffObject);
    }
    diffs.sort(function (a, b) {
        return (a.SR < b.SR ? -1 : -1);
    })
    for (i = 0; i < diffs.length; i++) {
        inputString += (
            diffs[i].url + ',' +
            '"' + diffs[i].artist + '"' + ',' +
            '"' + diffs[i].title + '"' + ',' +
            '"' + diffs[i].version + '"' + ',' +
            diffs[i].SR + ',' +
            diffs[i].AR + ',' +
            diffs[i].OD + ',' +
            diffs[i].CS + ',' +
            diffs[i].HP + ',' +
            diffs[i]['Circle Count'] + ',' +
            diffs[i]['Slider Count'] + ',' +
            diffs[i]['Spinner Count'] + ',' +
            '\n'
        );
    }
    await writeDifficultiesCSV(inputString);
    return;
}

async function iteratesThroughSet(beatmapSet) {
    var len = beatmapSet.length;
    let difficulties = [];
    for (i = 0; i < len; i++) {
        if (beatmapSet[i]['ranked'] == 1) {
            difficulties.push(beatmapSet[i]['id']);
        }
    }
    await iteratesThroughDifficulties(difficulties);
    return;
}

async function iteratesThroughBeatmaps(beatmaps) {
    let inputString = '';
    for (const beatmap of beatmaps) {
        inputString += (
            beatmap['beatmapset'] + ',' +
            beatmap['beatmap_id'] + ',' +
            beatmap['beatmapset_id'] + ',' +
            '"' + beatmap['artist'] + '"' + ',' +
            '"' + beatmap['title'] + '"' + ',' +
            beatmap['mapper'] + ',' +
            beatmap['date'] + ',' +
            beatmap['bpm'] + ',' +
            beatmap['total_length'] + ',' +
            beatmap['map_count'] + ','
            + '\n'
        );
        let beatmapSet = await osuAPI.getBeatmapSetDisc(api_key, beatmap['beatmapset_id']);
        await iteratesThroughSet(beatmapSet);
    };
    await writeBeatmapCSV(inputString);
    return;
}

async function main() {
    api_key = await osuAPI.getAPIkey();
    let i = 0;
    const BaseURL = 'https://osusearch.com/query/?statuses=Ranked&modes=Standard&date_start=2023-01-01&offset='
    let fetchLink = BaseURL + i;
    let { result_count, beatmaps } = await get2023beatmaps(fetchLink);
    let pageTotal = Math.floor(result_count / 18);
    await iteratesThroughBeatmaps(beatmaps);
    for (i = 1; i <= pageTotal; i++) {
        fetchLink = BaseURL + i;
        ({ result_count, beatmaps } = await get2023beatmaps(fetchLink));
        await iteratesThroughBeatmaps(beatmaps);
    }
}

main();