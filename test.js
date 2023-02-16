var fs = require('fs');

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
    writeStream = fs.createWriteStream('beatmaps.csv', {'flags': 'a'});
    writeStream.write(cleanInput);
}

async function iteratesThroughBeatmaps(beatmaps){
    inputString = '';
    for(const beatmap of beatmaps){
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
            +'\n'
        );
    };
    await writeBeatmapCSV(inputString);
}

async function main() {
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

// main();

//done, csv written

//next -> use beatmap id or beatmap setid to get further detailed description of each map diff