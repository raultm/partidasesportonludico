var db;
var xhr = new XMLHttpRequest();
xhr.open('GET', 'partidas.sqlite', true);
xhr.responseType = 'arraybuffer';
xhr.onload = async e => {
    db = new SQL.Database(new Uint8Array(xhr.response))
    const lastThreeMonthsGames = document.getElementById("last-three-months-games")
    const lastThreeMonthsUsers = document.getElementById("last-three-months-users")
    const lastThreeMonthsLocations = document.getElementById("last-three-months-locations")
    const yearGames = document.getElementById("year-games");
    const yearUsers = document.getElementById("year-users");
    const yearLocations = document.getElementById("year-locations");

    const data = await fetchDashboardData();
    renderList(lastThreeMonthsGames, data.lastThreeMonths.games)
    renderList(lastThreeMonthsUsers, data.lastThreeMonths.users, "cambiarImagenJugador")
    renderList(lastThreeMonthsLocations, data.lastThreeMonths.locations, "cambiarImagenLugar")
    renderList(yearGames, data.year.games)
    renderList(yearUsers, data.year.users,"cambiarImagenJugador")
    renderList(yearLocations, data.year.locations,"cambiarImagenLugar")

    const dataExplorer = data.tabla; //await fetchExplorerData();
    pintarTabla(dataExplorer)
}
xhr.send();

function pintarTabla(data) {
    // console.log("pintarTabla", data)
    // return
    
    new gridjs.Grid({
        columns: [
            {id: 'id', width: "120px",name: 'ID'}, 
            {id: 'date',width: "140px",name: 'Fecha'}, 
            //{id: 'recorder',name: 'Registrada por'}, 
            {id: 'game',name: 'Juego'}, 
            {id: 'location',name: 'Lugar'}, 
            {id: 'players', name: 'Jugadores', data: (row) => row.players.map(player => player.username == "" ? player.name : player.username).join(", ")}
        ],
        fixedHeader: true,
        pagination: true,
        search: true,
        sort: true,
        data: data,
    }).render(document.getElementById("wrapper"));
}

const toggleButton = document.getElementById("toggle-view");
const leadersSection = document.getElementById("leaders");
const gamesSection = document.getElementById("games");

toggleButton.addEventListener("click", () => {
  // Alterna entre visible y oculto
  const isLeadersVisible = leadersSection.style.display === "block";

  leadersSection.style.display = isLeadersVisible ? "none" : "block";
  gamesSection.style.display = isLeadersVisible ? "block" : "none";

  // Cambia el texto del botón
  toggleButton.textContent = isLeadersVisible ? "Clasificaciones" : "Explorar Partidas";
});

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
    //return execSQL("SELECT * FROM partidas")[0].values.map(partidaBGG => parsePlay(partidaBGG[1], JSON.parse(partidaBGG[4])))
}

async function fetchDashboardData() {

    let partidas = execSQL("SELECT * FROM partidas")[0].values
    let partidasUltimos3Meses = partidas.filter((partida) => partida[2] > threeMonthsAgo())
    return {
        tabla: partidas.map(partidaBGG => parsePlay(partidaBGG[1], JSON.parse(partidaBGG[4]))),
        lastThreeMonths: {
            games: top5(partidasUltimos3Meses
                .reduce((acc, partida) => {
                    acc[partida[3]] = (acc[partida[3]] || 0) + 1;
                    return acc;
                }, {})),
            users: top5(partidasUltimos3Meses
                .map(partidaBGG => parsePlay(partidaBGG[1],JSON.parse(partidaBGG[4])))
                .reduce((acc, partida) => {
                    partida.players.map(player => {
                        let name = player.id != '0' ? player.username : player.name
                        acc[name] = (acc[name] || 0) + 1;
                    })
                    return acc;
                }, {})
            ),
            locations: top5(partidasUltimos3Meses
                    .map(partidaBGG => parsePlay(partidaBGG[1], JSON.parse(partidaBGG[4])))
                    .reduce((acc, partida) => {
                        let name = partida.location
                        acc[name] = (acc[name] || 0) + 1;
                        return acc;
                    }, {})
            )

        },
        year: {
            games: top5(partidas
                .reduce((acc, partida) => {
                    acc[partida[3]] = (acc[partida[3]] || 0) + 1;
                    return acc;
                }, {})),
            users: top5(partidas
                .map(partidaBGG => parsePlay(partidaBGG[1], JSON.parse(partidaBGG[4])))
                .reduce((acc, partida) => {
                    partida.players.map(player => {
                        let name = player.id != '0' ? player.username : player.name
                        acc[name] = (acc[name] || 0) + 1;
                    })
                    return acc;
                }, {})
            ),
            locations: top5(partidas
                    .map(partidaBGG => parsePlay(partidaBGG[1], JSON.parse(partidaBGG[4])))
                    .reduce((acc, partida) => {
                        let name = partida.location
                        acc[name] = (acc[name] || 0) + 1;
                        return acc;
                    }, {})
            )

        },
    };
}

function renderList(element, data, fallbackImages = "cambiarImagenJuego") {
    element.innerHTML = data
        .map(item => `<li><img id="imagen-principal" src="asd.jpg" alt="${item.name}" onerror="${fallbackImages}(this)" />
<span>${item.name}</span> <span>${item.count} partidas</span></li>`)
        .join("");
}

function threeMonthsAgo() {
    // Fecha actual
    const fechaActual = new Date();

    // Restar tres meses
    const tresMesesAtras = new Date(fechaActual);
    tresMesesAtras.setMonth(fechaActual.getMonth() - 3);

    // Convertir a cadena en formato "YYYY-MM-DD"
    return tresMesesAtras.toISOString().split('T')[0];
}

function top5(entitesCount) {
    return Object.entries(entitesCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
}

function cambiarImagenJuego(imgElement) {

    const fallbackImages = [
        "boardgame_1.png",
        "boardgame_2.png",
        "boardgame_3.png",
    ];
    const src = fallbackImages[Math.floor(Math.random() * fallbackImages.length)]
    imgElement.src = src
}

function cambiarImagenJugador(imgElement) {

    const fallbackImages = [
        "user.png",
    ];
    const src = fallbackImages[Math.floor(Math.random() * fallbackImages.length)]
    imgElement.src = src
}

function cambiarImagenLugar(imgElement) {

    const fallbackImages = [
        "location_1.png",
        "location_2.png",
        "location_3.png",
        "location_4.png",
        "location_5.png",
        "location_6.png",
    ];
    const src = fallbackImages[Math.floor(Math.random() * fallbackImages.length)]
    imgElement.src = src
}

function parsePlay(recorder, playBggFormat) {
    console.log(playBggFormat)
    return {
        id: playBggFormat["_attributes"].id??0,
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
