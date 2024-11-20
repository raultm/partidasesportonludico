var db;
var xhr = new XMLHttpRequest();
xhr.open('GET', 'partidas.sqlite', true);
xhr.responseType = 'arraybuffer';
xhr.onload = async e => {
    db = new SQL.Database(new Uint8Array(xhr.response))
    const data = await fetchExplorerData();
    new gridjs.Grid({
        columns: [
            {id: 'id', name: 'ID'}, 
            {id: 'date',name: 'Fecha'}, 
            {id: 'recorder',name: 'Registrada por'}, 
            {id: 'game',name: 'Juego'}, 
            {id: 'location',name: 'Lugar'}, 
            {id: 'players', name: 'Jugadores', data: (row) => row.players.map(player => player.username == "" ? player.name : player.username).join(", ")}
        ],
        fixedHeader: true,
        pagination: true,
        search: true,
        sort: true,
        data: data
    }).render(document.getElementById("wrapper"));
}
xhr.send();

function execSQL(sql) {
    if (!db) { console.log("Database not loaded yet"); return; }
    return timed(() => db.exec(sql), sql)
}

function timed(fn, msg = "") {
    console.time("exec: " + msg)
    let result = fn()
    console.timeEnd("exec: " + msg)
    return result
}

async function fetchExplorerData() {

    return execSQL("SELECT * FROM partidas")[0].values.map(partidaBGG => parsePlay(partidaBGG[1], JSON.parse(partidaBGG[4])))

}


function parsePlay(recorder, playBggFormat) {
    console.log(playBggFormat)
    return {
        id: playBggFormat["_attributes"].id,
        date: playBggFormat["_attributes"].date,
        game: playBggFormat.item["_attributes"].name,
        location: playBggFormat["_attributes"].location,
        recorder: recorder,
        players: parsePlayers(playBggFormat.players?.player)
    }
}

function parsePlayers(players) {
    if (!players || !Array.isArray(players)) return [];
    if (Array.isArray(players)) return players.map(parsePlayer);
    return [parsePlayer(players)];
}

function parsePlayer(player) {
    return {
        id: player["_attributes"].userid,
        username: player["_attributes"].username,
        name: player["_attributes"].name,
        score: player["_attributes"].score
    }
}



