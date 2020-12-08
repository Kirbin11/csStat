const e = require('express');
const express = require('express')
const hbs = require("hbs");
const { nextTick } = require('process');
const PORT = process.env.PORT || 8000
const mapStats = require("./mapStats");
const HLTV = require('hltv-api').default;
const CSMaps = ['de_dust2', 'de_mirage','de_inferno','de_nuke',
                 'de_train', 'de_overpass',
                'de_vertigo'];


hbs.registerPartials(__dirname + "/views/partials");

function countBets(goodMatches, mapsStat){
  var overall = [];
    goodMatches.forEach(match => {
      var team1 = match.teams[0].name;
      var team2 = match.teams[1].name;
      var MapAndBet = [];
      mapsStat.forEach(map => {
        var team1stat = map.stats.find(e=> { return e.teamName === team1});
        var team2stat = map.stats.find(e=> { return e.teamName === team2});
        var mapBets = '';
        if((team1stat != undefined) && (team2stat != undefined)) {
          if((team1stat.winrateCT - team2stat.winrateT) >= 10)
          mapBets += team1 + ' wins CT / ';
          else if ((team1stat.winrateCT - team2stat.winrateT) <= -10)
          mapBets += team2 + ' wins T / ';
  
          if((team1stat.winrateT - team2stat.winrateCT) >= 10)
          mapBets += team2 + ' wins CT / ';
          else if((team1stat.winrateT - team2stat.winrateCT) <= -10)
          mapBets += team1 + ' wins T / ';
        }
        else {
          mapBets += 'no bets found';
        }
        if (mapBets == '')  { mapBets += 'no bets found'};
        MapAndBet.push({someMap : map.oneMap, someBet : mapBets});
      })
      
      overall.push({Match : team1 + ' versus ' + team2, MapsBets : MapAndBet})
    })
  return overall;
}


express()
.set("view engine", "hbs")
//.use(async (req, res) => {
// })
.get('/', async (req, res) => {
   
    
  const matches = await HLTV.getMatches();
    var goodMatches = matches.filter(e => { 
    if (e.stars > 0 && e.teams[0].name != '' && e.teams[1].name != '') return true
    else return false });
    const mapsStat = [];
    var timeout = 0;
    CSMaps.forEach(element => {
    setTimeout(async function(){
    var stat = await mapStats.getFinalStatForMap(element);
    mapsStat.push({oneMap : element, stats : stat});
    }, timeout);
    timeout+=5000;
    });

    function timeoutFunc() {
      if (mapsStat.length > 6) { 
        console.log('privet')
        var final = countBets(goodMatches, mapsStat);
       // res.render("index.hbs", {
       //   Matches: final
       // });
       
      };
      console.log('passed');
      setTimeout(timeoutFunc, 5000);
    }
    
    //timeoutFunc();
    ///////get 
    res.send('hello');
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
