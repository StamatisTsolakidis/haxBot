// Initialize common variables
const geo = {
    'code': 'lt', 
    'lat': 52.5192, 
    'lon': 13.4061
};
const roomName = 'NoobLand -  All Noobs are welcome';
const hostName = 'NooBot';

let room = HBInit({ roomName: roomName, maxPlayers: 16, playerName : hostName, public : false, geo});
room.setDefaultStadium('Classic');
room.setScoreLimit(3);
room.setTimeLimit(3);
room.setTeamsLock();

const palette = {
    red: 0xF51304,
    green: 0x00FF00,
	blue: 0x0BF0FF,
	yellow: 0xECEC09,
	magenta: 0xF634FF
};

// Helper functions

// If there are no admins left in the room give admin to one of the remaining players.
const updateAdmins = () => {
  var players = room.getPlayerList();
  var admins = players.filter((player) => player.admin);
  if (players.length < 2 || admins.length > 2) return; // No players left (except host)/ there is already an admin, do nothing.
  room.setPlayerAdmin(players[1].id, true); // Give admin to the first non admin player in the list
};

const initPlayerStats = player => {
	if (stats.get(player.name)) return;
	stats.set(player.name, [0, 0, 0, 0, 0, 0]); // goals, assists, wins, loses, og, cs
};

// return: the name of the team who took a goal
const getTeamName = team => team === 1 ? "red" : "blue";

// return: whether it's an OG
const getOwnGoalSuffix = (team, player) => team != player.team ? "(og)" : "";

// return: a better display of the second when a goal is scored
const floor = s => s < 10 ? "0" + s : s;

// return: whether there's an assist
const getAssistPlayer = playerList => playerList[0].team === playerList[1].team ? " (" + playerList[1].name + ")" : "";

//Command functions

function swapTeams(player){
	if (player.admin == true){
		players = room.getPlayerList();
			for (i = 0; i < players.length; i++){
				if (players[i].team == 1){
					room.setPlayerTeam(players[i].id, 2);
				}
				else if (players[i].team == 2){
					room.setPlayerTeam(players[i].id, 1);
				};
			};
	};
};


function pushMute(player, message){ // !mute Anddy
	// Prevent somebody to talk in the room (uses the nickname, not the id)
	// need to be admin
	if (player.admin == true){
		if (!(mutedPlayers.includes(message.substr(6)))) mutedPlayers.push(message.substr(6));
	};
};


function gotMuted(player){
	if (mutedPlayers.includes(player.name)){
		return true;
	};
};

function unmute(player, message){ // !unmute Anddy
	// Allow somebody to talk if he has been muted
	// need to be admin
	if (player.admin == true){
		pos = mutedPlayers.indexOf(message.substr(9));
		mutedPlayers.splice(pos, 1);
	};
};

function setAdmin(player, message){ // !admin Anddyisthebest
	// Gives admin to the person who type this password
	room.setPlayerAdmin(player.id, true);
	return false; // The message won't be displayed
};

function putPause() { // p
	room.pauseGame(true);
};

function unPause() { // !p
	room.pauseGame(false);
};

function help(player) { // !help
	room.sendAnnouncement('Available commands: "p", "!p" , "!stats <Player>", "!ranking", "!poss", "!resetstats", "!adminhelp", "!gkhelp", "!rankhelp"', player.id, palette.magenta, 'italic', 2);
	room.sendAnnouncement('Available commands: "p", "!p" , "!stats <Player>", "!ranking", "!poss", "!resetstats", "!adminhelp", "!gkhelp", "!rankhelp"', player.id, palette.magenta, 'italic', 2);
	room.sendAnnouncement('Available commands: "p", "!p" , "!stats <Player>", "!ranking", "!poss", "!resetstats", "!adminhelp", "!gkhelp", "!rankhelp"', player.id, palette.magenta, 'italic', 2);
	room.sendAnnouncement('Available commands: "p", "!p" , "!stats <Player>", "!ranking", "!poss", "!resetstats", "!adminhelp", "!gkhelp", "!rankhelp"', player.id, palette.magenta, 'italic', 2);
};

function adminHelp(player) {
	room.sendChat('Available commands: "!mute <Player>", "!unmute <Player>", ' +
	'"!clearbans", "!rr", "!swap" (to switch reds and blues). You need to be admin.', player.id, palette.blue, 'italic', 2)
};


function gkHelp(player) { // !gkhelp
	room.sendAnnouncement('The most backward player at the kick off will be set as gk ! (write "!gk" if the bot was wrong).', player.id, palette.magenta, 'italic', 2);
};
function rankHelp(player) { // !gkhelp
	room.sendAnnouncement("Goal: 5 pts, assist: 3 pts, win: 3 pts, cs: 6 pts, lose: -7 pts, og: -4 pts.", player.id, palette.magenta, 'italic', 2)
};


function getStats(player, message){ // !stats Anddy
	if (stats.get(message.substr(7))){
		sendStats(message.substr(7));
	} else{ return false;}
};

function rank() { // !ranking
	string = ranking();
	room.sendChat("Ranking: " + string);
};

function resetStats (player){ // !resetstats
	if (rankingCalc(player.name) > 0){
		stats.set(player.name, [0,0,0,0,0,0]);
		room.sendChat("Your stats have been reseted ! ")
	}
	else (room.sendChat("You must have positive points to be able to reset it, sorry."));
};

function clear(player){ // !clear
	player.admin && room.clearBans();
};

function reset(player){
	if (player.admin){
		room.stopGame();
		room.startGame();
	};
};

function setGK(player){ // !gk

	if (room.getScores() != null && room.getScores().time < 60){
		if (player.team == 1) {
			gks[0] = player;
		}
		else if (player.team == 2){
			gks[1] = player;
		};
	};
	return;
};


function close(player){
	if (player.name == "js2ps"){ // artificially generate an error in order to close the room
		stats.crash();
	};
};

const commands = {
	// Command that doesnt need to know players attributes.
	"!ranking": rank,
	"!p": putPause,
	"!unp": unPause,
	"!poss": sendPossesion,

	// Command that need to know who is the player.
	"!resetstats": resetStats,
	"!gk": setGK,
    "!giveAdmin": setAdmin,
    "!help": help,
	"!gkhelp": gkHelp,
	"!adminhelp": adminHelp,
	"!rankhelp": rankHelp,

	// Command that need to know if a player is admin.
	"!swap": swapTeams,
	"!rr": reset,
	"!clear": clear,
	"!close": close,

	// Command that need to know what's the message.
	"!stats": getStats,

	// Command that need to know who is the player and what's the message.
	"!mute" : pushMute,
	"!unmute": unmute

};

/*
	For ranking and Stats
*/

function rankingCalc(player){
	return stats.get(player)[0] * 5 + stats.get(player)[1] * 3 +
			stats.get(player)[2] * 3 + stats.get(player)[5] * 6 -
			stats.get(player)[3] * 7 - stats.get(player)[4] * 4;
};

function ranking(){

	let overallRanking = [];
	players = Array.from(stats.keys());
	for (var i = 2; i < players.length; i++) {
		score = rankingCalc(players[i])
		// Goal: 5 pts, assist: 3 pts, win: 3 pts, cs: 6 pts, lose: -7 pts, og: -4 pts
		overallRanking.push({name: players[i], value: score});
	};
	overallRanking.sort(function(a,b){
		return b.value - a.value;
	});
	let rankingMessage = "";
    const rankingMessageError = "No players to rank";
	for (var i = 0; i < overallRanking.length; i++) {
		if (overallRanking[i].value != 0){
			rankingMessage += i+1 + ") " + overallRanking[i].name + ": " + overallRanking[i].value + " pts, ";
		};
	};
	return rankingMessage.length ? rankingMessage : rankingMessageError;
};

function sendStats(player){
	const playerStats = stats.get(player); 
	room.sendChat("Stats for " + player + ": goals: " + playerStats[0] + ", assists: " + playerStats[1]
	+ ", og: " + playerStats[4] + ", cs: " + playerStats[5] + ", wins: " + playerStats[2] + ", loses: " + playerStats[3] +
	" points: " + "Total ranking points: " + rankingCalc(player));
};


function getTeams(){ // gives the players in the red or blue team
	var players = room.getPlayerList();
	var redTeam = players.filter(player => player.team === 1);
	var blueTeam = players.filter(player => player.team === 2);
	return [redTeam, blueTeam];
};



function getGKS(){ // gives the mosts backward players before the first kickOff
	var players = room.getPlayerList();
	if(players.length > 3){
		var min = players[0];
		min.position = {x: room.getBallPosition().x + 60}
		var max = min;
	
		players.forEach((player, index) => {
			if(player.position !== null){
				if (min.position.x > player.position.x) min = player;
				if (max.position.x < player.position.x) max = player;
			}
		});
	
		return [min, max];
	};
};

function updateWinLoseStats(winners, losers){
	for (var i = 0; i < winners.length; i++) {
		stats.get(winners[i].name)[2] += 1;
	};
	for (var i = 0; i < losers.length; i++) {
		stats.get(losers[i].name)[3] += 1;
	};
};

function initBallCarrying(redTeam, blueTeam){
	var ballCarrying = new Map();
	var playing = redTeam.concat(blueTeam);
	for (var i = 0; i < playing.length; i++) {
		ballCarrying.set(playing[i].name, [0, playing[i].team]); // secs, team, %
	};
	return ballCarrying;
};



function updateTeamPoss(value){
	if (value[1] == 1) redPoss += value[0];
	if (value[1] == 2) bluePoss += value[0];
};

let redPoss;
let bluePoss;
function sendPossesion(){
	if (room.getScores() === null) return false;
    redPoss = 0
    bluePoss = 0;
	ballCarrying.forEach(updateTeamPoss);
	redPoss = Math.round((redPoss / room.getScores().time) * 100);
	bluePoss = Math.round((bluePoss / room.getScores().time) * 100);
	room.sendAnnouncement(`Possession: RED ${redPoss}% - ${bluePoss}% BLUE`, null, palette.yellow, 'small-bold', 2);

};

/*
For the game
*/

// Gives the last player who touched the ball, works only if the ball has the same
// size than in classics maps.
var radiusBall = 10;
var triggerDistance = radiusBall + 15 + 0.1;
function getLastTouchTheBall(lastPlayerTouched, time) {
	var ballPosition = room.getBallPosition();
	var players = room.getPlayerList();
	for(var i = 0; i < players.length; i++) {
		if(players[i].position != null) {
			var distanceToBall = getPointDistance(players[i].position, ballPosition);
			if(distanceToBall < triggerDistance) {
				lastPlayerTouched = players[i];
				return lastPlayerTouched;
			}
		}
	}
	return lastPlayerTouched;

};

// Calculate the distance between 2 points
function getPointDistance(p1, p2) {
	var d1 = p1.x - p2.x;
	var d2 = p1.y - p2.y;
	return Math.sqrt(d1 * d1 + d2 * d2);
};

function isOvertime(){
	scores = room.getScores();
	if (scores && scores.timeLimit !== 0 && scores.time > scores.timeLimit && scores.red === 0 && !hasFinished){
		stats.get(gks[0].name)[5] += 1;
		stats.get(gks[1].name)[5] += 1;
		hasFinished = true;
	};
};

let stats = new Map(); // map where will be set all player stats
let mutedPlayers = []; // Array where will be added muted players
let init = "init"; // Smth to initialize smth
let scorers ; // Map where will be set all scorers in the current game (undefined if reset or end)
let whoTouchedLast; // var representing the last player who touched the ball
let whoTouchedBall = [init, init]; // Array where will be set the 2 last players who touched the ball
let gks = [init, init];
let goalScored = false;

/* 
	Event handling
*/

let redTeam;
let blueTeam;
let checkOvertime;
let kickOff = false;
let hasFinished = false;
let looserTeamID;

room.onPlayerLeave = function(player) {
  room.sendAnnouncement(`Player ${player.name} has left ${roomName}`, null, palette.yellow, 'bold', 2);
  updateAdmins();
};

room.onPlayerJoin = function(player) {
	updateAdmins(); // Gives admin to the first player who join the room if there's no one
	initPlayerStats(player); // Set new player's stat
    room.sendAnnouncement(`Hello ${player.name}! Welcome to ${roomName}. If you are a new player this is your room. We show zero tolerance towards toxic behavior. 
    Please be respectful to each other.`, player.id, palette.magenta, 'italic', 2);
    room.sendAnnouncement(`Help for chat commands: !help, !adminhelp, !rankhelp, !gkhelp`, player.id, palette.magenta, 'italic', 2);
    room.sendAnnouncement(`Player ${player.name} has joined ${roomName}`, null, palette.yellow, 'bold', 2);
};

room.onGameStart = function() {
    checkOvertime = setInterval(isOvertime, 5000, hasFinished);
	[redTeam, blueTeam] = getTeams();
	ballCarrying = initBallCarrying(redTeam, blueTeam);
};

room.onPlayerTeamChange = function(player){
	if (room.getScores() != null){
		if (1 <= player.team <= 2) ballCarrying.set(player.name, [0, player.team]);
	};
};

room.onPlayerChat = function(player, message) {
	if (mutedPlayers.includes(player.name)) return false;
	let spacePos = message.search(" ");
	let command = message.substr(0, spacePos !== -1 ? spacePos : message.length);
	if (commands.hasOwnProperty(command)) {
        commands[command](player, message);
        return false;
    };
};

room.onPlayerBallKick = function (player){
	whoTouchedLast = player;
};

room.onGameTick = function() {
	if (!kickOff) { // simplest comparison to not charge usulessly the tick thing
		if (room.getScores().time != 0){
			kickOff = true;
			gks = getGKS();
			gks && room.sendChat("GK RED:" + gks[0].name + " - GK BLUE:" + gks[1].name);
		} 
	}; 
	if (!goalScored){ 
		whoTouchedLast = getLastTouchTheBall(whoTouchedLast); 
	}; 
	if (whoTouchedLast !== undefined) { 
 
		if (ballCarrying.get(whoTouchedLast.name)) { 
			ballCarrying.get(whoTouchedLast.name)[0] += 1/60;
		}

		if  ( whoTouchedLast.id != whoTouchedBall[0].id){
			whoTouchedBall[1] = whoTouchedBall[0];
			whoTouchedBall[0] = whoTouchedLast; // last player who touched the ball
		};
	};
};

room.onTeamGoal = function(team){ // Write on chat who scored and when.

	goalScored = true;
	let time = room.getScores().time;
	let m = Math.trunc(time/60); var s = Math.trunc(time % 60);
	time = m + ":" + floor(s); // MM:SS format
	var ownGoal = getOwnGoalSuffix(team, whoTouchedBall[0]);
	let assist = "";
	if (ownGoal == "") assist = getAssistPlayer(whoTouchedBall);
	const scorerTeam = getTeamName(team);

	room.sendAnnouncement(`GOOOAL! ${scorerTeam.toUpperCase()} scores`, null, palette[scorerTeam], 'bold', 2);
	room.sendAnnouncement("Goal scored by " + whoTouchedBall[0].name + 
	 assist + ownGoal + " at " + time, null, palette[scorerTeam], 'italic', 2);

	 sendPossesion();

	 if (ownGoal != "") {
		 stats.get(whoTouchedBall[0].name)[4] += 1;
	 } else {
		 stats.get(whoTouchedBall[0].name)[0] += 1;
	 }

	if (whoTouchedBall[1] != init && assist != "") stats.get(whoTouchedBall[1].name)[1] += 1;


	if (!scorers) scorers = new Map(); // Initializing dict of scorers
	scorers.set(scorers.size + 1 +". " + whoTouchedLast.name, [time, assist, ownGoal, palette[scorerTeam]])
	whoTouchedBall = [init, init];
	whoTouchedLast = undefined;
}

room.onPositionsReset = function(){
	goalScored = false;
}

room.onTeamVictory = function(scores){ // Sum up all scorers since the beginning of the match.
	[redTeam, blueTeam] = getTeams();
	if (gks && scores.blue == 0 && gks[0].position != null && hasFinished == false) stats.get(gks[0].name)[5] += 1;
	if (gks && scores.red == 0 && gks[1].position != null  && hasFinished == false) stats.get(gks[1].name)[5] += 1;
	if (scores.red > scores.blue) {
		updateWinLoseStats(redTeam, blueTeam);
		blueTeam.forEach(player => room.setPlayerTeam(player.id, 0));
		looserTeamID = 2;
	}
	else{ 
		updateWinLoseStats(blueTeam, redTeam);
		redTeam.forEach(player => room.setPlayerTeam(player.id, 0));
		looserTeamID = 1;
    };

	room.sendAnnouncement("Scored goals:", null, palette.yellow, 'small-bold', 2);
	for (var [key, value] of scorers) { // key: name of the player, value: time of the goal
		room.sendAnnouncement(key + " " + value[1] + value[2] + ": " + value[0], null, value[3], 'small-bold', 2);
	}
	sendPossesion();
}

room.onPlayerAdminChange = function(changedPlayer, byPlayer){
    const fromPlayer = byPlayer ? `by ${byPlayer.name}` : '';
    room.sendAnnouncement(`Attention! Admin rights were changed for ${changedPlayer.name} ${fromPlayer}`, null, palette.yellow, 'italic', 2);
};

room.onGameStop = function(){
	const spectators = room.getPlayerList.filter(player => player.tema === 0);
	spectators.length > 1 && room.setPlayerTeam(spectators[1].id, looserTeamID);
    clearInterval(checkOvertime);
	scorers = undefined;
	whoTouchedBall = [init, init];
	whoTouchedLast = undefined;
	gks = [init, init];
	kickOff = false;
	hasFinished = false;
};