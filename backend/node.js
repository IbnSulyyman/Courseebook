const Parse = require("parse/node");

const APP_ID = "403QXntisL9WKQBkFzSMCplu5wo6QTtcfbdQEdzX"
const JAVASCRIPT_KEY = "b6ECz5K4917ka5uYYnsUsFR8kG6J7pjSSI6ZbFvH"

console.log("Initializing Parse..., APP_ID")
Parse.initialize(APP_ID, JAVASCRIPT_KEY);
Parse.serverURL = "https://parseapi.back4app.com/";

const NbaPlayersClassName = Parse.Object.extend("NbaPlayers");

const ppgPPL = [
    {
      PlayerName: 'Lebron James',
      PlayerTeam: 'Lakers',
      PlayerPPG: 30.2
    },
    {
      PlayerName: 'James Lebron',
      PlayerTeam: 'Dakers',
      PlayerPPG: 31.2
    },
    {
      PlayerName: 'Adam Sulaiman',
      PlayerTeam: 'Bahus',
      PlayerPPG: 100
    }
];

const pushPlayerData = async () => {
    let batchSaveData = [];

    for (let i = 0; i < ppgPPL.length; i++) {
        const objToPush = new NbaPlayersClassName();
        objToPush.set("PlayerName", ppgPPL[i].PlayerName);
        objToPush.set("PlayerTeam", ppgPPL[i].PlayerTeam);
        objToPush.set("PlayerPPG", ppgPPL[i].PlayerPPG);

        batchSaveData.push(objToPush);
    }
    const pushToDB = await Parse.Object.saveAll(batchSaveData)
    return pushToDB
}

pushPlayerData()

