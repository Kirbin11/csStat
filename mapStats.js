"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatches = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const node_fetch_1 = __importDefault(require("node-fetch"));
function getCurrentDate(){
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    return year + "-" + month + "-" + date;
}
function getMonthsBack(){
let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() - 2)).slice(-2);
    let year = date_ob.getFullYear();
    return year + "-" + month + "-" + date;
}
function getMapStats(map, side){
return __awaiter(this, void 0, void 0, function* () {
  const url = `https://www.hltv.org/stats/teams/pistols?startDate=` + getMonthsBack() +
  '&endDate=' + getCurrentDate() + '&maps='+ map + '&minMapCount=4&side=' + side + '&rankingFilter=Top30';
  try {
      const body = yield (yield node_fetch_1.default(url, {
          headers: { 'User-Agent': 'node-fetch' },
      })).text();
      const $ = cheerio_1.default.load(body, {
          normalizeWhitespace: true,
      });
      const allContent = $('.stats-table tbody tr');
      
      const teams = [];
      allContent.map((_i, element) => {
          const el = $(element);
          const name = el.children('td').first().children('a').text();
          const winrate = el.children('td:nth-child(4)').text().slice(0, -1);
          const response = {
              name,
              winrate,
          };
          teams[teams.length] = response;
         
      });
      if (!teams.length) {
          throw new Error('There are no matches available, something went wrong. Please contact the library maintainer on https://github.com/dajk/hltv-api');
      }
      return teams;
  }
  catch (error) {
      throw new Error(error);
  }
});
}

async function getFinalStatForMap(map){
    const CSSide = {ct: 'COUNTER_TERRORIST', t: 'TERRORIST'};
    const csmapCT = await getMapStats(map, CSSide.ct);
    const csmapT = await getMapStats(map, CSSide.t);
    var mapStat = [];
         csmapCT.map(item => {
           csmapT.map(item1 => {
             if (item.name === item1.name) {
               const teamName = item.name;
               const winrateCT = item.winrate;
               const winrateT = item1.winrate;
               const result = {teamName , winrateCT, winrateT};
               mapStat[mapStat.length] = result;
             }
           })
         });
         return mapStat;
}

exports.getMapStats = getMapStats;
exports.getFinalStatForMap = getFinalStatForMap;