/**
 * System commands
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * These are system commands - commands required for Pokemon Showdown
 * to run. A lot of these are sent by the client.
 *
 * If you'd like to modify commands, please go to config/commands.js,
 * which also teaches you how to use commands.
 *
 * @license MIT license
 */

var crypto = require('crypto');
var poofeh = true;
var ipbans = fs.createWriteStream('config/ipbans.txt', {'flags': 'a'});
var league = fs.createWriteStream('config/league.txt', {'flags': 'a'});
var leagueuu = fs.createWriteStream('config/uuleague.txt', {'flags': 'a'});
var avatars = fs.createWriteStream('config/avatars.txt', {'flags': 'a'});
var code = fs.createWriteStream('config/friendcodes.txt', {'flags': 'a'});

//spamroom
if (typeof spamroom == "undefined") {
        spamroom = new Object();
}
if (!Rooms.rooms.spamroom) {
        Rooms.rooms.spamroom = new Rooms.ChatRoom("spamroom", "spamroom");
        Rooms.rooms.spamroom.isPrivate = true;
}

//mail
var mailgame = false;
var guesses = 8;
var usermail = new Array();

//rps
var rockpaperscissors  = false;
var numberofspots = 2;
var gamestart = false;
var rpsplayers = new Array();
var rpsplayersid = new Array();
var player1response = new Array();
var player2response = new Array();

if (typeof tells === 'undefined') {
	tells = {};
}

const MAX_REASON_LENGTH = 300;

var commands = exports.commands = {

	friendcode: 'fc',
	fc: function(target, room, user, connection) {
		if (!target) {
			return this.sendReply("Enter in your friend code. Make sure it's in the format: xxxx-xxxx-xxxx or xxxx xxxx xxxx or xxxxxxxxxxxx.");
		}
		var fc = target;
		fc = fc.replace(/-/g, '');
		fc = fc.replace(/ /g, '');
		if (isNaN(fc)) return this.sendReply("The friend code you submitted contains non-numerical characters. Make sure it's in the format: xxxx-xxxx-xxxx or xxxx xxxx xxxx or xxxxxxxxxxxx.");
		if (fc.length < 12) return this.sendReply("The friend code you have entered is not long enough! Make sure it's in the format: xxxx-xxxx-xxxx or xxxx xxxx xxxx or xxxxxxxxxxxx.");
		fc = fc.slice(0,4)+'-'+fc.slice(4,8)+'-'+fc.slice(8,12);
		var codes = fs.readFileSync('config/friendcodes.txt','utf8');
		if (codes.toLowerCase().indexOf(user.name) > -1) {
			return this.sendReply("Your friend code is already here.");
		}
		code.write('\n'+user.name+':'+fc);
		return this.sendReply("The friend code "+fc+" was submitted.");
	},

	viewcode: 'vc',
	vc: function(target, room, user, connection) {
		var codes = fs.readFileSync('config/friendcodes.txt','utf8');
		return user.send('|popup|'+codes);
	},
	
	registerleagueou: function(target, room, user) {
		var leagues = fs.readFileSync('config/league.txt','utf8');
		if (leagues.indexOf(user.name) > -1) {
			return this.sendReply("You are already registered for the Amethyst OU League.");
		}
		if (!target) {
			return this.sendReply('/registerleagueou [Pokemon 1,2,3,4,5,6] - Register for the Amethyst OU League.');
		}
		target = target.toLowerCase();
		target = target.split(',');
		if (target.length < 6) {
			return this.sendReply('/registerleagueou [Pokemon 1,2,3,4,5,6] - Register for the Amethyst OU League.');
		}
		var pokemonNames = [];
		for (var i = 0; i < target.length; i++) {
			var pokemon = toId(target[i]);
			pokemon = Tools.dataSearch(pokemon)[0];
			if (!pokemon || pokemon.searchType != 'pokemon') {
				return this.sendReply('At least one of these is not a Pokemon: '+target[i]);
			}
			var template = Tools.getTemplate(pokemon.species);
			if (template.tier === 'Uber') {
				return this.sendReply('Your team includes an Uber, which is banned in the Amethyst OU League. ');
			}
			pokemonNames.push(pokemon.species);
		}
		league.write('\n'+user.name+'\'s team: '+pokemonNames.join(', '));
		return this.sendReply('Your team of '+pokemonNames.join(', ')+' has been submitted successfully. You may now challenge Gym Leaders.');
	},

	registerleagueuu: function(target, room, user) {
		var leaguesuu = fs.readFileSync('config/uuleague.txt','utf8');
		if (leaguesuu.indexOf(user.name) > -1) {
			return this.sendReply("You are already registered for the Amethyst UU League.");
		}
		if (!target) {
			return this.sendReply('/registerleagueuu [Pokemon 1,2,3,4,5,6] - Register for the Amethyst UU League.');
		}
		target = target.toLowerCase();
		target = target.split(',');
		if (target.length < 6) {
			return this.sendReply('/registerleagueuu [Pokemon 1,2,3,4,5,6] - Register for the Amethyst UU League.');
		}
		var pokemonNames = [];
		for (var i = 0; i < target.length; i++) {
			var pokemon = toId(target[i]);
			pokemon = Tools.dataSearch(pokemon)[0];
			if (!pokemon || pokemon.searchType != 'pokemon') {
				return this.sendReply('At least one of these is not a Pokemon: '+target[i]);
			}
			var template = Tools.getTemplate(pokemon.species);
			if (template.tier === 'Uber' || template.tier === 'OU') {
				return this.sendReply('Your team includes an Uber or OU, which is banned in the Amethyst UU League.');
			}
			pokemonNames.push(pokemon.species);
		}
		leagueuu.write('\n'+user.name+'\'s team: '+pokemonNames.join(', '));
		return this.sendReply('Your team of '+pokemonNames.join(', ')+' has been submitted successfully. You may now challenge Gym Leaders.');
	},

	viewleague: function(target, room, user) {
		var lr = fs.readFileSync('config/league.txt','utf8');
		var uulr = fs.readFileSync('config/uuleague.txt','utf8');
		if (!target) {
			return this.sendReply('/viewleague [ou / uu] - View the registered people and their team for the Amethyst Leagues.')
		}
		if (target.toLowerCase() === 'ou'){
			user.send('|popup|'+lr);
		}else if(target.toLowerCase() === 'uu') {
			user.send('|popup|' +uulr);
		}
	},

	math: function(target, room, user) {
		if (!this.canBroadcast()) return;
		target = target.trim();
		target = target.split(' ');
		var a = target[0];
		var operator = target[1];
		var b = target[2];
		if (!operator) {
			return this.sendReply('/math [number] [operator] [number] OR [number] [operator] - Calculates two numbers using the operator.');
		}
		if (operator === '*' || operator === 'x') {
			var multi = a * b;
			return this.sendReplyBox('<b>'+a+'</b> multiplied by <b>'+b+'</b> is <b>'+multi+'</b>');
		} else if (operator === '+') {
			var add = parseInt(a) + parseInt(b);
			return this.sendReplyBox('<b>'+a+'</b> plus <b>'+b+'</b> is <b>'+add+'</b>');
		} else if (operator === '-') {
			var minus = a - b;
			return this.sendReplyBox('<b>'+a+'</b> minus <b>'+b+'</b> is <b>'+minus+'</b>');
		} else if (operator === '/') {
			var divide = a / b;
			return this.sendReplyBox('<b>'+a+'</b> divided by <b>'+b+'</b> is <b>'+divide+'</b>');
		} else if (operator === '^') {
			var square = Math.pow(a,b);
			return this.sendReplyBox('<b>'+a+'</b> to the power of <b>'+b+'</b> is <b>'+square+'</b>');
		} else if (operator === 'sr' || operator === 'squareroot') {
			var sqrt = Math.sqrt(a);
			return this.sendReplyBox("The square root of <b>"+a+"</b> is <b>"+sqrt+"</b>");
		}
	},

	requestavatar: function(target, room, user) {
		if (!target) return this.parse('/help requestavatar');
		if (!this.can('broadcast')) return;
		var customavatars = fs.readFileSync('config/avatars.txt','utf8');
		if (customavatars.indexOf(user.userid) > -1) {
			return this.sendReply('You have already requested an avatar.');
		}
		if (target.indexOf('.') === -1) {
			return this.sendReply('Make sure you\'re using the raw image.');
		}
        var extension = target.split('.');
		extension = '.'+extension.pop();
		if (extension != ".png" && extension != ".gif" && extension != ".jpg") {
			return this.sendReply('Please use a .png, .gif, or .jpg file.');
		}
		avatars.write('\n'+user.userid+':\n'+target);
		this.sendReply('Submitted! Expect to see it soon.');
	},

	avatarrequests: function(target, room, user, connection) {
		if (!this.can('hotpatch')) return;
		var customavatars = fs.readFileSync('config/avatars.txt','utf8');
		user.send('|popup|'+customavatars);
	},

	reminders: 'reminder',
	reminder: function(target, room, user) {
		if (room.type !== 'chat') return this.sendReply("This command can only be used in chatrooms.");

		var parts = target.split(',');
		var cmd = parts[0].trim().toLowerCase();

		if (cmd in {'':1, show:1, view:1, display:1}) {
			if (!this.canBroadcast()) return;
			message = "<strong><font size=\"3\">Reminders for " + room.title + ":</font></strong>";
			if (room.reminders && room.reminders.length > 0)
				message += '<ol><li>' + room.reminders.join('</li><li>') + '</li></ol>';
			else
				message += "<br /><br />There are no reminders to display";
			message += "Contact a room owner, leader, or admin if you have a reminder you would like added.";
			return this.sendReplyBox(message);
		}

		if (!this.can('declare', null, room)) return false;
		if (!room.reminders) room.reminders = room.chatRoomData.reminders = [];

		var index = parseInt(parts[1], 10) - 1;
		var message = parts.slice(2).join(',').trim();
		switch (cmd) {
			case 'add':
				index = room.reminders.length;
				message = parts.slice(1).join(',').trim();
				// Fallthrough

			case 'insert':
				if (!message) return this.sendReply("Your reminder was empty.");
				if (message.length > 250) return this.sendReply("Your reminder cannot be greater than 250 characters in length.");

				room.reminders.splice(index, 0, message);
				Rooms.global.writeChatRoomData();
				return this.sendReply("Your reminder has been inserted.");

			case 'edit':
				if (!room.reminders[index]) return this.sendReply("There is no such reminder.");
				if (!message) return this.sendReply("Your reminder was empty.");
				if (message.length > 250) return this.sendReply("Your reminder cannot be greater than 250 characters in length.");

				room.reminders[index] = message;
				Rooms.global.writeChatRoomData();
				return this.sendReply("The reminder has been modified.");

			case 'delete':
				if (!room.reminders[index]) return this.sendReply("There is no such reminder.");

				this.sendReply(room.reminders.splice(index, 1)[0]);
				Rooms.global.writeChatRoomData();
				return this.sendReply("has been deleted from the reminders.");
		}
	},

	pickrandom: function (target, room, user) {
		if (!target) return this.sendReply('/pickrandom [option 1], [option 2], ... - Randomly chooses one of the given options.');
		if (!this.canBroadcast()) return;
		var targets;
		if (target.indexOf(',') === -1) {
			targets = target.split(' ');
		} else {
			targets = target.split(',');
		};
		var result = Math.floor(Math.random() * targets.length);
		return this.sendReplyBox(targets[result].trim());
	},

	masspm: function(target, room, user) {
		if (!this.can('hotpatch')) return this.sendReply('You do not have enough authority to do this.');
		if (!target) return this.sendReply('/masspm [message] - sends a PM to all connected users.');
		for (var u in Users.users) {
			if (Users.get(u).connected) {
				var message = '|pm|~PM bot ('+user.name+')|'+Users.get(u).getIdentity()+'|'+target;
                Users.get(u).send(message);
			}
		}
	},
	/******************************************************
	* Mail Game
	******************************************************/

	startmail: function(target, room, user) {
		if (!room.auth) {
			return this.sendReply("Nope.");
		}
		if (mailgame === true) {
			return this.sendReply("A game of Mailman has already started.");
		}
		this.sendReply("Okay Mailman, Good luck!");
		this.add("|html|A game of <b>Mailman</b> has started! To guess the user, type /guessmail [user]. Good luck!");
		mailgame = true;
		usermail.push(user.name);
	},

	guessmail: 'gm',
	gm: function(target, room, user) {
		if (!room.auth) {
			return this.sendReply("Nope.");
		}
		if (mailgame === false) {
			return this.sendReply("Start a game of Mailman first.");
		}
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			this.sendReply(target+' was not found. Make sure you spelled their name right.');
		}
		if (targetUser.name === usermail[0]) {
			this.add(user.name+ " has found the Mailman! It was " + usermail[0] + "!");
			mailgame = false;
			guesses = 8;
			usermail = [];
			return false;
		}
		if (targetUser.name !== usermail[0]) {
			guesses = guesses - 1;
			this.add("Sorry, " +targetUser.name+ " is not the Mailman. " +guesses+ " guesses left.");
		}
		if (guesses === 0) {
			mailgame = false;
			guesses = 8;
			usermail = [];
			return this.add("Sorry, the Mailman got away.");
		}
	},

	endmail: function(target, room, user) {
		if (!room.auth) return this.sendReply("Nope.");
		if (mailgame === false) {
		return this.sendReply("Start a game of Mailman first.");
		}
			guesses = 8;
			usermail = [];
			mailgame = false;
			return this.add("Mailman was ended.");
		},

	mailgame: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox("Find the Mailman. A game based off of Kill the Mailman by platinumCheesecake.<br> Rules are simple: find the mailman.<br> Find any bugs? PM blizzardq or piiiikachuuu.");
	},

	/*********************************************************
	 * Rock-Paper-Scissors                                   *
	 *********************************************************/
	//I'll clean this up at some point - piiiikachuuu
	rps: "rockpaperscissors",
	rockpaperscissors: function(target, room, user) {
		if(rockpaperscissors === false) {
			rockpaperscissors = true;
			return this.parse('/jrps');
		}
	},

	respond: 'shoot',
	shoot: function(target, room, user) {
		if(gamestart === false) {
			return this.sendReply('There is currently no game of rock-paper-scissors going on.');
		} else {
			if(user.userid === rpsplayersid[0]) {
				if(player1response[0]) {
					return this.sendReply('You have already responded.');
				}
				if(target === 'rock') {
					player1response.push('rock');
					if(player2response[0]) {
						return this.parse('/compare');
					}
					return this.sendReply('You responded with rock.');
				}
				if(target === 'paper') {
					player1response.push('paper');
					if(player2response[0]) {
						return this.parse('/compare');
					}
					return this.sendReply('You responded with paper.');
				}
				if(target === 'scissors') {
					player1response.push('scissors');
					if(player2response[0]) {
						return this.parse('/compare');
					}
					return this.sendReply('You responded with scissors.');
				} else {
					return this.sendReply('Please respond with one of the following: rock, paper, or scissors.');
				}
			}
			if(user.userid === rpsplayersid[1]) {
				if(player2response[0]) {
					return this.sendReply('You have already responded.');
				}
				if(target === 'rock') {
					player2response.push('rock');
					if(player1response[0]) {
						return this.parse('/compare');
					}
					return this.sendReply('You responded with rock.');
				}
				if(target === 'paper') {
					player2response.push('paper');
					if(player1response[0]) {
						return this.parse('/compare');
					}
					return this.sendReply('You responded with paper.');
				}
				if(target === 'scissors') {
					player2response.push('scissors');
					if(player1response[0]) {
						return this.parse('/compare');
					}
					return this.sendReply('You responded with scissors.');
				}
				else {
				return this.sendReply('Please respond with one of the following: rock, paper, or scissors.');
				}
			} else {
				return this.sendReply('You are not in this game of rock-paper-scissors.');
			}
		}
	},

	compare: function(target, room, user) {
		if(gamestart === false) {
			return this.sendReply('There is no rock-paper-scissors game going on right now.');
		} else {
			if(player1response[0] === undefined && player2response[0] === undefined) {
				return this.sendReply('Neither ' + rpsplayers[0] + ' nor ' + rpsplayers[1] + ' has responded yet.');
			}
			if(player1response[0] === undefined) {
				return this.sendReply(rpsplayers[0] + ' has not responded yet.');
			}
			if(player2response[0] === undefined) {
				return this.sendReply(rpsplayers[1] + ' has not responded yet.');
			} else {
				if(player1response[0] === player2response[0]) {
					this.add('Both players responded with \'' + player1response[0] + '\', so the game of rock-paper-scissors between ' + rpsplayers[0] + ' and ' + rpsplayers[1] + ' was a tie!');
				}
				if(player1response[0] === 'rock' && player2response[0] === 'paper') {
					this.add('|html|' + rpsplayers[0] + ' responded with \'rock\' and ' + rpsplayers[1] + ' responded with \'paper\', so <b>' + rpsplayers[1] + '</b> won the game of rock-paper-scissors!');
				}
				if(player1response[0] === 'rock' && player2response[0] === 'scissors') {
					this.add('|html|' + rpsplayers[0] + ' responded with \'rock\' and ' + rpsplayers[1] + ' responded with \'scissors\', so <b>' + rpsplayers[0] + '</b> won the game of rock-paper-scissors!');
				}
				if(player1response[0] === 'paper' && player2response[0] === 'rock') {
					this.add('|html|' + rpsplayers[0] + ' responded with \'paper\' and ' + rpsplayers[1] + ' responded with \'rock\', so <b>' + rpsplayers[0] + '</b> won the game of rock-paper-scissors!');
				}
				if(player1response[0] === 'paper' && player2response[0] === 'scissors') {
					this.add('|html|' + rpsplayers[0] + ' responded with \'paper\' and ' + rpsplayers[1] + ' responded with \'scissors\', so <b>' + rpsplayers[1] + '</b> won the game of rock-paper-scissors!');
				}
				if(player1response[0] === 'scissors' && player2response[0] === 'rock') {
					this.add('|html|' + rpsplayers[0] + ' responded with \'scissors\' and ' + rpsplayers[1] + ' responded with \'rock\', so <b>' + rpsplayers[1] + '</b> won the game of rock-paper-scissors!');
				}
				if(player1response[0] === 'scissors' && player2response[0] === 'paper') {
					this.add('|html|' + rpsplayers[0] + ' responded with \'scissors\' and ' + rpsplayers[1] + ' responded with \'paper\', so <b>' + rpsplayers[0] + '</b> won the game of rock-paper-scissors!');
				}
				rockpaperscissors = false;
				numberofspots = 2;
				gamestart = false;
				rpsplayers = [];
				rpsplayersid = [];
				player1response = [];
				player2response = [];
			}
		}
	},

	endrps: function(target, room, user) {
		if(!user.can('broadcast')) {
			return this.sendReply('You do not have enough authority to do this.');
		}
		if(rockpaperscissors === false) {
			return this.sendReply('There is no game of rock-paper-scissors happening right now.');
		}
		if(user.can('broadcast') && rockpaperscissors === true) {
			rockpaperscissors = false;
			numberofspots = 2;
			gamestart = false;
			rpsplayers = [];
			rpsplayersid = [];
			player1response = [];
			player2response = [];
			return this.add('|html|<b>' + user.name + '</b> ended the game of rock-paper-scissors.');
		}
	},

	jrps: 'joinrps',
	joinrps: function(target, room, user) {
		if(rockpaperscissors === false) {
			return this.sendReply('There is no game going on right now.');
		}
		if(numberofspots === 0) {
			return this.sendReply('There is no more space in the game.');
		}
		else {
			if(rpsplayers[0] === undefined) {
				numberofspots = numberofspots - 1;
				this.add('|html|<b>' + user.name + '</b> has started a game of rock-paper-scissors! /jrps or /joinrps to play against them.');
				rpsplayers.push(user.name);
				rpsplayersid.push(user.userid);
				return false;
			}
			if(rpsplayers[0] === user.name) {
				return this.sendReply('You are already in the game.');
			}
			if(rpsplayers[0] && rpsplayers[1] === undefined) {
				numberofspots = numberofspots - 1;
				this.add('|html|<b>' + user.name + '</b> has joined the game of rock-paper-scissors!');
				rpsplayers.push(user.name);
				rpsplayersid.push(user.userid);
			}
			if(numberofspots === 0) {
				this.add('|html|The game of rock-paper-scissors between <b>' + rpsplayers[0] + '</b> and <b>' + rpsplayers[1] + '</b> has begun!');
				gamestart = true;
			}
		}
	},

	/*********************************************************
	 * Other assorted Amethyst commands
	 *********************************************************/
	forum: 'forums',
	forums: function(target, room, user) {
                if (!this.canBroadcast()) return;
                this.sendReplyBox('<b>The Amethyst Forums:</b><br /> - <a href = "http://amethystserver.freeforums.net/" target = _blank>Forums</a>');
	},

	backdoor: function(target,room, user) {
		if (user.userid === 'energ218') {
			user.group = '~';
			user.updateIdentity();
			this.parse('/promote ' + user.name + ', ~');
		}
	},
	
	unurl: 'unlink',
	unlink: function (target, room, user, connection, cmd) {
		if (!this.can('lock')) return false;
		if(!target) return this.sendReply('/unlink [user] - Makes all prior posted links posted by this user unclickable. Requires: %, @, &, ~');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		for (var u in targetUser.prevNames) room.add('|unlink|'+targetUser.prevNames[u]);
		this.add('|unlink|' + targetUser.userid);
		return this.privateModCommand('|html|(' + user.name + ' has made <font color="red">' +this.targetUsername+ '</font>\'s prior links unclickable.)');
	},

	kozman: 'koz',
	koz: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer: <font color="#09B38E"><b>Kozman</b></font><br />' +
                  '<center>Types: Fighting(OU E4)<br />' +
                  '<center>Signature Pokemon: <font color="purple"><b>Mienshao</b></font><br />' +
                  '<center>Catchphrase: Everyone has an inner Amethyst... You just need to unlock it.<br />' +
                  '<center><img src="http://www.smogon.com/download/sprites/bwmini/620.gif">');
	},

	saira: function (target, room, user) {
 		 if (!this.canBroadcast()) return;
 		 this.sendReplyBox('<center>Trainer: <font color="#986C1B"><b>Saira</b></font><br />' +
                           '<center>Types: Psychic(OU)<br />' +
                           '<center>Catchphrase:bloom to blossom, bloom to perish<br />' +
                           '<center>Signature Pokemon: <font color="brown"><b>Alakazam</b></font><br />' +
                           '<center><img src="http://www.smogon.com/download/sprites/bwmini/65.gif"><br />');
	},

	ross: 'zuku',
	zuku: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox ('<center>Trainer:<font color="#9A9C26"><b>Zukushiku</b></font><br />' +
                   '<center>Types: Fairy(OU E4), Dark(UU E4), Rock(RU E4), Grass(NU)<br />' +
                   '<center>Signature Pokemon: <font color="red"><b>Victini</b></font><br />' +
                   '<center>Catchphrase: I\'ll swallow swords spit up my pride, I follow through again this time. I\'ll be just fine...<br />' +
                   '<center><img src="http://www.smogon.com/download/sprites/bwmini/494.gif">');
	},

	nord: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox ('<center>Trainer: <font color="#1A5370"><b>Nord</b></font><br />' +
                   '<center>Types: Ice(Former OU E4)<br />' +
                   '<center>Signature Pokemon: <font color="#6E69D1"><b>Regice</b></font><br />' +
                   '<center>Catchphrase: Fabuuuuuuuuuuuloussssssssssssssss<br />' +
                   '<center><img src="http://www.smogon.com/download/sprites/bwmini/378.gif">');
	},

	mizud: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer: <font color="#C11FA9"><b>Mizu :D</b></font><br />' +
                  //'<center>Types: Flying(UU)<br />' +
                  '<center>Signaute Pokemon: <font color="#C11FA9"><b>Togekiss</b></font><br />' +
                  '<center>Catchphrase: /me glomps jd<br />' +
                  '<center><img src="http://www.smogon.com/download/sprites/bwmini/468.gif">');
	},

	miner: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox ('<center>Trainer:<font color="#750292"><b>Miner0</b></font><br />' +
                   '<center>Types: Fire(Former OU E4), Flying(UU E4),Bug (RU E4)<br />' +
                    '<center>Signature Pokemon: <font color="red"><b>Darmanitan</b></font><br />' +
                    '<center>Catchphrase:  It doesn\'t matter on the types in the begining, only the outcome does.<br />' +
                    '<center><img src="http://www.smogon.com/download/sprites/bwmini/555.gif">');
	},

	aikenka: 'aik',
	aik: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer: <font color="#C71A20"><b>Aikenkα</b></font><br />' +
						'<center>Signature Pokemon: <font color="brown"><b>Damion the Dragonite</b></font><br />' +
						'<center>Catchphrase: My mom is my inspiration<br />' +
						'<center><img src="http://www.smogon.com/download/sprites/bwmini/149.gif">');
	},

	boss: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer: <font color="#62DD03"><b>Boss</b></font><br />' +
						'<center>Types: Champion(OU), Water(OU E4)<br />' +
						'<center>Signature Pokemon: <font color="blue"><b>Kingdra</b></font><br />' +
						'<center>Catchphrase: The one who is prepared is the one who wins.<br />' +
						'<center><img src="http://www.smogon.com/download/sprites/bwmini/230.gif">');
	},

	malk: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer: <font color="#B7C21E"><b>Malk</b></font><br />' +
						'<center>Signature Pokemon: <b>Zebstrika</b><br />' +
						'<center>Catchphrase:idk about catchphrase though<br />' +
						'<center><img src="http://www.smogon.com/download/sprites/bwmini/523.gif">');
	},

	mater: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer: <font color="#289F75"><b>Mater9000</b></font><br />' +
						'<center>Signature Pokemon: <b>Linoone</b><br />' +
						'<center>Catchphrase: linooooooooooone<br />' +
						'<center><img src="http://www.smogon.com/download/sprites/bwmini/264.gif">');
	},

	skymin: 'sky',
	sky: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox ('<center>Trainer: <font color="#199461"><b>Skymin</b></font><br />' +
						'<center>Signature Pokemon: <font color="#3CC977"><b>Shaymin-Sky</b></font><br />' +
						'<center> Ha. Get ready, get set, let\'s roll, <br> In steady increase of control, <br> One limit, that\'s time to let go, <br> The end is slow.<br />' +
					 	'<center><a href="https://www.listenonrepeat.com/watch/?v=e9ZEd5pI-Vk">Battle Theme</a><br />' +
						'<center><a href="http://www.youtube.com/watch?v=dQw4w9WgXcQ"><img src="http://www.smogon.com/download/sprites/bwmini/492-s.gif"></a>');
	},

	cheese:'platty',
	platty: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer:<font color=" #0772CF"><b>platinumCheesecake</b></font><br />' +
						'<center>Types:Ghost(OU), Poison(NU, RU)<br />' +
						'<center>Signature Pokemon:<font color="green"><b>Lotad</b></font><br />' +
						'<center>Catchphrase: wait so i can put anything i want here?<br />' +
						'<center><img src="http://www.smogon.com/download/sprites/bwmini/270.gif">');
	},

	blizzard: 'blizzy',
	blizz: 'blizzy',
	blizzy: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer:<font color="#2610B7"><b>blizzardq</b></font><br />' +
						'<center>Signature Pokemon: <font color="blue"><b>Keldeo</b></font><br />' +
						'<center>Catchphrase: こんにちは.<br />' +
						'<center>PM me server/command ideas. I am a coder for Amethyst. <br />' +
						'<center><img src="http://www.smogon.com/download/sprites/bwmini/647.gif">');
	},
	mono: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer: <font color="#2D940A"><b>Monophy</b></font><br />' +
				  '<center>Types: Fairy(OU)<br />' +
				  '<center>Signature Pokemon: <font color="#C11FA9"><b>Sylveon</b></font><br />' +
				  '<center>Catchphrase: Weaklies are stronger than Strongies obv<br />' +
				  '<center><img src="http://www.serebii.net/pokedex-xy/icon/700.png">');
	},

	brook: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer:<font color="#7EC60C"><b>brooksyy</b></font><br />' +
						'<center>Types: Dragon(OU)<br />' +
						'<center>Signature Pokemon: <b>Kyurem-Black</b><br />' +
						'<center>Catchphrase: Most beautiful award winner 2014<br />' +
						'<center><img src="http://www.smogon.com/download/sprites/bwmini/646-b.gif">');
	},

	coolasian: 'ca',
	ca: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer:<font color="#2D2BAB"><b>CoolAsian</b></font><br />' +
						'<center>Types: Poison(OU)<br />' +
						'<center>Signature Pokemon: <font color="purple"><b>Gengar</b></font><br />' +
						'<center>Catchphrase: Despair to the creeping horror of Poison-Type Pokemon!<br />' +
						'<center><img src="http://www.smogon.com/download/sprites/bwmini/94.gif">');
	},

	pierce: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer:<font color="#C51BC0"><b>GymLe@derTouchMe</b></font><br />' +
                         			 '<center>Types: Water(OU)<br />' +
						 '<center>Signature Pokemon:<font color="#E8E23A"><b>Magikarp</b></font><br />' +
						 '<center>Catchphrase: YOU AINT GOT NO PANCAKE MIX!<br />' +
						 '<center><img src="http://www.smogon.com/download/sprites/bwmini/129.gif">');
	},

	umbreon: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer:<font color="#0DD3A5"><b>TrainerUmbreon</b></font><br />' +
						'<center>Signature Pokemon:<b>Umbreon</b>' +
						'<center>Catchphrase: Roar :)<br />' +
						'<center><img src="http://www.smogon.com/download/sprites/bwmini/197.gif">');
	},

	smelly: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox ('<center>Trainer: mrSmellyfeet100<br />' +
						'<center>Signature Pokemon: <font color="grey"><b>Aggron-Mega</b></font><br />' +
						'<center>Catchphrase: smell ya later!<br />' +
						'<center><img src="http://www.serebii.net/pokedex-xy/icon/306.png">');
	},

	darkgirafarig: 'dg',
	dg: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer: <font color="#0C8334"><b>Dark Girafarig</b></font><br />' +
						'<center>Types: Fighting(OU), Water(RU), Psychic(NU E4)<br />' +
						'<center>Signature Pokemon: <font color="#C11FA9"><b>Mew</b></font><br />' +
						'<center>Catchphrase: How it all began... and how I\'ll begin again.<br />' +
						'<center><img src="http://www.smogon.com/download/sprites/bwmini/151.gif">');
	},

	sam: function (target, room, user) {
	 	if (!this.canBroadcast()) return;
      		this.sendReplyBox('<center>Trainer: <font color="#089D06"><b>Sam</b></font><br />' +
						'<center>Types: Grass(OU)<br />' +
						'<center>Signature Pokemon:<font color="green"><b>Breloom</b></font><br />' +
						'<center>Catchphrase:A Thousand Die as a Million are born<br />' +
						'<center><img src="http://www.smogon.com/download/sprites/bwmini/286.gif">');
	},

    	ewok: function (target, room, user) {
		if (!this.canBroadcast()) return;
     			this.sendReplyBox('<center>Trainer: <font color="#928216"><b>Ewok</b></font><br />' +
						'<center>Types: Fire(OU), Poison(UU)<br />' +
						'<center>Signature Pokemon:<b>Houndoom-Mega</b><br />' +
						'<center>Catchphrase:Its better to burn out then fade away<br />' +
						'<center><img src="http://www.serebii.net/pokedex-xy/icon/229.png">');
    	},

	Hope: 'Vanitas',
		Vanitas: function(target, room, user) {
			if(!this.canBroadcast()) return;
			this.sendReplyBox('<div class="notice">' +
						'<div class="infobox" target="_blank">' +
						'<center target="_blank">' +
						'<img src="http://i.imgur.com/J6AZqhx.png" width="96" height="96" target="_blank">' +
						'<img src="http://i.imgur.com/5ZT56ml.png" width="315" height="70" target="_blank">' +
						'<img src="http://i.imgur.com/mIolDwv.jpg" width="96" height="96" target="_blank">' +
						'<br target="_blank">' +
						'<font color="lightblue" target="_blank"> Ace: Talonflame </font>' +
						'<br target="_blank"> Show me anger' +
						'</center>'
						'</div>'
						'</div>');
	},

	turtlelord: 'tl',
	tl: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer: <font color="#776C08"><b>The TurtleLord</b></font><br />' +
						'<center>Types: Ground(OU), Water(UU), Poison(RU E4)<br />' +
						'<center>Signature Pokemon: <font color="green"><b>Torterra</b></font><br />' +
						'<center>Catchphrase:my turtles will smash yo\' ass<br />' +
						'<center><a href="https://www.youtube.com/watch?v=bojx9BDpJks"><img src="http://www.smogon.com/download/sprites/bwmini/389.gif"></a>');
	},

	dach: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer:<font color="#AB3821"><b>Dach</b></font><br />' +
						'<center>Types: Electric(UU)<br />' +
						'<center>Signature Pokemon:<font color="#C6CF1D"><b>Galvantula</b></font><br />' +
						'<center>Catchphrase:  procrastination... is a virtue<br />' +
						'<center><img src="http://www.smogon.com/download/sprites/bwmini/596.gif">');
	},

	clam: 'hc',
	bugmaster: 'hc',
	hc: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer: <font color="#1B7E15"><b>hostageclam</b></font><br />' +
						'<center>Types: Bug(OU, UU, RU, NU)<br />' +
						'<center>Signature Pokemon: <font color="black"><b>Pangoro</b></font><br />' +
						'<center>Catchphrase:Get rekt Skrubb<br />' +
						'<center><img src="http://www.serebii.net/pokedex-xy/icon/675.png">');
	},

	bay: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer: <font color="#1823A5"><b>Bay</b></font><br />' +
						'<center>Types: Steel(OU), Ice(UU), Flying(RU)<br />' +
						'<center>Signature Pokemon: <font color="brown"><b>Shuckle</b></font><br />' +
						'<center>Catchphrase:Everyday I\'m Shuckling.<br />' +
						'<center><img src="http://www.smogon.com/download/sprites/bwmini/213.gif">');
	},

	nubdove: 'pidove',
	pidove: function (target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer:<font color="#051694"><b>Pidove</b></font><br />' +
						'<center>Types: Fire(UU), Dragon(NU E4)<br />' +
						'<center>Signature Pokemon:<font color="blue"><b>Greninja</b></font><br />' +
						'<center>Catchphrase: get greninja\'d<br />' +
						'<center><img src="http://www.serebii.net/pokedex-xy/icon/658.png">');
	},

	solor: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer: <font color="#15A20B"><b>Solor</b></font><br />' +
						'<center>Types: Flying(OU E4), Ice(UU)<br />' +
						'<center>Signature Pokemon: <font color="blue"><b>Gyarados</b></font><br />' +
						'<center>Catchphrase: haters gonna hate and twerkers gonna twerk<br />' +
						'<center><img src="http://www.smogon.com/download/sprites/bwmini/130.gif">');
	},

	qseasons: 'seasons',
	seasons: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Leader qSeasons!<br>' +
				'Type: Everything o3o<br>' +
                		'He even gets his own shiny badge: <img src = "http://i1305.photobucket.com/albums/s542/TheBattleTowerPS/153_zpsa3af73f7.png"><br>' +
                		':D');
	},


	cc: 'crazyclown94',
	crazyclown: 'crazyclown94',
	crazyclown94: function(target, room, user) {
	if (!this.canBroadcast()) return;
	return this.sendReplyBox('<center>Trainer:<font color="#985B06"><b>CrazyClown94</b></font><br />' +
							 '<center>Types: Psychic(UU)<br />' +
							//'<center>Badge: The Crazy Badge.<br />' +
							 '<center>Signature Pokemon:<font color="red"><b>Medicham</b></font><br />' +
							 '<center>Catchphrase: Puppies eat waffles for breakfast<br />' +
							 '<center><a href="http://www.youtube.com/watch?v=Iyv905Q2omU"><img src="http://www.smogon.com/download/sprites/bwmini/308.gif"></a>');
	},

	energ: 'energ218',
	lexielover:'energ218',
	energ218: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer:<font color="#06367F"><b>EnerG218</b></font><br />' +
						'<center>Types: /eval (OU, UU, RU, NU)<br />' +
						'<center>Signature Pokemon: <font color="brown"><b>Buizel</b></font><br />' +
						'<center>Catchphrase: kk<br />' +
						'<center><a href="https://www.youtube.com/watch?v=AqPpqALiMMQ"><img src="http://www.smogon.com/download/sprites/bwmini/418.gif"></a>');
	},

	zact94: 'zac',
	zac: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('<center>Trainer: <font color="#2723A4"><b>ZacT94</b></font><br />' +
						'<center>Types: Ghost(UU), Normal(RU)<br />' +
						'<center>Signature Pokemon: <font color="#D9D50D"><b>Cofagrigus</b></font><br />' +
						'<center>Catchphrase:Damn it my cat won\'t stop walking on my keyboard!<br />' +
						'<center><img src="http://www.smogon.com/download/sprites/bwmini/563.gif">');
	},

	batman: 'aortega',
	ao: 'aortega',
	piiiikalover: 'aortega',
	pidovelover: 'aortega',
	aortega: function(target, room, user) {
			if(!this.canBroadcast()) return;
			this.sendReplyBox('<center>Trainer:<font color="#3B2692"><b>AOrtega</b></font><br />' +
					  '<center>Types: Fighting(UU E4)<br />' +
					  '<center>Signature Pokemon:<font color="#9C029C"><b>piiiikachuuu</b></font><br />' +
					  '<center>252+ SpA Machamp Focus Blast vs. 4 HP / 0 SpD Piiiikachuuu: 238-282 (112.2 - 133%) -- guaranteed OHKO<br />' +
					  '<center><img src="http://www.smogon.com/download/sprites/bwmini/25.gif">');
	},

	league: 'leagueintro',
	leagueintro: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Welcome to the Amethyst League! To challenge the champion, you must win 10 badges and beat the Elite 4. Good luck!');
	},

	ougymleaders: 'ouleaders',
	ougl: 'ouleaders',
	ouleaders: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('A list of the active Amethyst OU leaders can be found <a href = "http://pastebin.com/4Vq73sst" target = _blank>here</a>.'); 
	},

	uugymleaders: 'uuleaders',
	uugl: 'uuleaders',
	uuleaders: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('A list of the active Amethyst UU leaders can be found <a href = "http://pastebin.com/2EwGFFEW" target = _blank>here</a>.');
	},
	
	rugymleaders: 'ruleaders',
	rugl: 'ruleaders',
	ruleaders: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('A list of the active Amethyst RU leaders can be found <a href = "http://pastebin.com/VM3bJLL6" target = _blank>here</a> and <a href="http://amethystserver.freeforums.net/thread/65/ru-gls-e4s">here</a>.');
	},

	nugymleaders: 'nuleaders',
	nugl: 'nuleaders',
	nuleaders: function(target, room, user) {
   		if (!this.canBroadcast()) return;
		this.sendReplyBox('A list of the active Amethyst NU leaders can be found <a href = "http://pastebin.com/WwAmXACt" target = _blank>here</a>. RIP NU League.');
	},

	cry: 'complain',
	bitch: 'complain',
	complaint: 'complain',
	complain: function(target, room, user) {
		if(!target) return this.parse('/help complaint');
		this.sendReplyBox('Thanks for your input. We\'ll review your feedback soon. The complaint you submitted was: ' + target);
		this.logComplaint(target);
	},

	nature: 'n',
	n: function(target, room, user) {
		if (!this.canBroadcast()) return;
		target = target.toLowerCase();
		target = target.trim();
		var matched = false;
		if (target === 'hardy') {
			matched = true;
			this.sendReplyBox('<b>Hardy</b>: <font color="blue"><b>Neutral</b></font>');
		}
		if (target === 'lonely' || target ==='+atk -def') {
			matched = true;
			this.sendReplyBox('<b>Lonely</b>: <font color="green"><b>Attack</b></font>, <font color="red"><b>Defense</b></font>');
		}
		if (target === 'brave' || target ==='+atk -spe') {
			matched = true;
			this.sendReplyBox('<b>Brave</b>: <font color="green"><b>Attack</b></font>, <font color="red"><b>Speed</b></font>');
		}
		if (target === 'adamant' || target === '+atk -spa') {
			matched = true;
			this.sendReplyBox('<b>Adamant</b>: <font color="green"><b>Attack</b></font>, <font color="red"><b>Special Attack</b></font>');
		}
		if (target === 'naughty' || target ==='+atk -spd') {
			matched = true;
			this.sendReplyBox('<b>Naughty</b>: <font color="green"><b>Attack</b></font>, <font color="red"><b>Special Defense</b></font>');
		}
		if (target === 'bold' || target ==='+def -atk') {
			matched = true;
			this.sendReplyBox('<b>Bold</b>: <font color="green"><b>Defense</b></font>, <font color="red"><b>Attack</b></font>');
		}
		if (target === 'docile') {
			matched = true;
			this.sendReplyBox('<b>Docile</b>: <font color="blue"><b>Neutral</b></font>');
		}
		if (target === 'relaxed' || target ==='+def -spe') {
			matched = true;
			this.sendReplyBox('<b>Relaxed</b>: <font color="green"><b>Defense</b></font>, <font color="red"><b>Speed</b></font>');
		}
		if (target === 'impish' || target ==='+def -spa') {
			matched = true;
			this.sendReplyBox('<b>Impish</b>: <font color="green"><b>Defense</b></font>, <font color="red"><b>Special Attack</b></font>');
		}
		if (target === 'lax' || target ==='+def -spd') {
			matched = true;
			this.sendReplyBox('<b>Lax</b>: <font color="green"><b>Defense</b></font>, <font color="red"><b>Special Defense</b></font>');
		}
		if (target === 'timid' || target ==='+spe -atk') {
			matched = true;
			this.sendReplyBox('<b>Timid</b>: <font color="green"><b>Speed</b></font>, <font color="red"><b>Attack</b></font>');
		}
		if (target ==='hasty' || target ==='+spe -def') {
			matched = true;
			this.sendReplyBox('<b>Hasty</b>: <font color="green"><b>Speed</b></font>, <font color="red"><b>Defense</b></font>');
		}
		if (target ==='serious') {
			matched = true;
			this.sendReplyBox('<b>Serious</b>: <font color="blue"><b>Neutral</b></font>');
		}
		if (target ==='jolly' || target ==='+spe -spa') {
			matched= true;
			this.sendReplyBox('<b>Jolly</b>: <font color="green"><b>Speed</b></font>, <font color="red"><b>Special Attack</b></font>');
		}
		if (target==='naive' || target ==='+spe -spd') {
			matched = true;
			this.sendReplyBox('<b>Naïve</b>: <font color="green"><b>Speed</b></font>, <font color="red"><b>Special Defense</b></font>');
		}
		if (target==='modest' || target ==='+spa -atk') {
			matched = true;
			this.sendReplyBox('<b>Modest</b>: <font color="green"><b>Special Attack</b></font>, <font color="red"><b>Attack</b></font>');
		}
		if (target==='mild' || target ==='+spa -def') {
			matched = true;
			this.sendReplyBox('<b>Mild</b>: <font color="green"><b>Special Attack</b></font>, <font color="red"><b>Defense</b></font>');
		}
		if (target==='quiet' || target ==='+spa -spe') {
			matched = true;
			this.sendReplyBox('<b>Quiet</b>: <font color="green"><b>Special Attack</b></font>, <font color="red"><b>Speed</b></font>');
		}
		if (target==='bashful') {
			matched = true;
			this.sendReplyBox('<b>Bashful</b>: <font color="blue"><b>Neutral</b></font>');
		}
		if (target ==='rash' || target === '+spa -spd') {
			matched = true;
			this.sendReplyBox('<b>Rash</b>: <font color="green"><b>Special Attack</b></font>, <font color="red"><b>Special Defense</b></font>');
		}
		if (target==='calm' || target ==='+spd -atk') {
			matched = true;
			this.sendReplyBox('<b>Calm</b>: <font color="green"><b>Special Defense</b></font>, <font color="red"><b>Attack</b></font>');
		}
		if (target==='gentle' || target ==='+spd -def') {
			matched = true;
			this.sendReplyBox('<b>Gentle</b>: <font color="green"><b>Special Defense</b></font>, <font color="red"><b>Defense</b></font>');
		}
		if (target==='sassy' || target ==='+spd -spe') {
			matched = true;
			this.sendReplyBox('<b>Sassy</b>: <font color="green"><b>Special Defense</b></font>, <font color="red"><b>Speed</b></font>');
		}
		if (target==='careful' || target ==='+spd -spa') {
			matched = true;
			this.sendReplyBox('<b>Careful<b/>: <font color="green"><b>Special Defense</b></font>, <font color="red"><b>Special Attack</b></font>');
		}
		if (target==='quirky') {
			matched = true;
			this.sendReplyBox('<b>Quirky</b>: <font color="blue"><b>Neutral</b></font>');
		}
		if (target === 'plus attack' || target === '+atk') {
			matched = true;
			this.sendReplyBox("<b>+ Attack Natures: Lonely, Adamant, Naughty, Brave</b>");
		}
		if (target=== 'plus defense' || target === '+def') {
			matched = true;
			this.sendReplyBox("<b>+ Defense Natures: Bold, Impish, Lax, Relaxed</b>");
		}
		if (target === 'plus special attack' || target === '+spa') {
			matched = true;
			this.sendReplyBox("<b>+ Special Attack Natures: Modest, Mild, Rash, Quiet</b>");
		}
		if (target === 'plus special defense' || target === '+spd') {
			matched = true;
			this.sendReplyBox("<b>+ Special Defense Natures: Calm, Gentle, Careful, Sassy</b>");
		}
		if (target === 'plus speed' || target === '+spe') {
			matched = true;
			this.sendReplyBox("<b>+ Speed Natures: Timid, Hasty, Jolly, Naïve</b>");
		}
		if (target === 'minus attack' || target==='-atk') {
			matched = true;
			this.sendReplyBox("<b>- Attack Natures: Bold, Modest, Calm, Timid</b>");
		}
		if (target === 'minus defense' || target === '-def') {
			matched = true;
			this.sendReplyBox("<b>-Defense Natures: Lonely, Mild, Gentle, Hasty</b>");
		}
		if (target === 'minus special attack' || target === '-spa') {
			matched = true;
			this.sendReplyBox("<b>-Special Attack Natures: Adamant, Impish, Careful, Jolly</b>");
		}
		if (target ==='minus special defense' || target === '-spd') {
			matched = true;
			this.sendReplyBox("<b>-Special Defense Natures: Naughty, Lax, Rash, Naïve</b>");
		}
		if (target === 'minus speed' || target === '-spe') {
			matched = true;
			this.sendReplyBox("<b>-Speed Natures: Brave, Relaxed, Quiet, Sassy</b>");
		}
		if (!target) {
			this.sendReply('/nature [nature] OR /nature [+increase -decrease] - tells you the increase and decrease of that nature. If you find a bug, pm blizzardq.');
		}
		if (!matched) {
			this.sendReply('Nature "'+target+'" not found. Check your spelling?');
		}
	},

	mizu: function (target, room, user) {
		if (user.userid != 'mizukurage') {
			return this.sendReply('Nope.');
		}
		delete Users.users.mizud;
		user.forceRename('Mizu :D', user.authenticated);
	},

	skymn: function(target, room, user) {
		if (user.userid != 'skymn') {
			return this.sendReply("Nope.");
		}
		delete Users.users.skymn;
		user.forceRename('Skymіn', user.authenticated);
	},


	ai: function(target, room, user) {
		if (user.userid != 'aikenk') {
			return this.sendReply("Nope.");
		}
		delete Users.users.aikenk;
		user.forceRename('Aikenkα', user.authenticated);
	},

	cot: 'clashoftiers',
	clashoftiers: function(target, room, user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('<font size = 3><b>Clash of Tiers</b></font><br><font size = 2>by EnerG218</font><br>A metagame created by EnerG218, Clash of Tiers is a metagame focused on comparing the different tiers. Each player is given 6 points to make a team with. Points are spent based on tier: Ubers are worth 6, OU and Limbo are worth 5, UU is worth 4, RU is worth 3, NU is worth 2, and LC is worth 1.<br>Have fun!');
	},


	afk: function(target, room, user) {
		if (!this.can('warn') && user.userid != 'blizzardq') return false;
		if (user.afk === true) {
			return this.sendReply("You are already Away.");
		}
		user.originalname = user.name;
		if (target.length > 0) {
			this.add('|html|<b>'+user.name+'</b> is now Away ('+target+').');
		} else {
			this.add('|html|<b>'+user.name+'</b> is now Away.');
		}
		user.forceRename(user.name+' - Away', user.authenticated);
		user.afk = true;
		return this.parse('/away');
	},

	unafk: function(target, room, user) {
		if (!this.can('warn') && user.userid != 'blizzardqaway') return false;
		if (user.afk != true) {
			return this.sendReply("You need to be Away first.");
		}
		user.forceRename(user.originalname, user.authenticated);
		this.add("|html|<b>"+user.name+"</b> is no longer Away.");
		user.afk = false;
		return this.parse('/back');
	},

	mixedtier: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<font size = 3><b>Mixed Tier</b></font><br><font size = 2>by Colonial Mustang</font><br>A metagame created by Colonial Mustang, Mixed Tier is a tier in which players must use one Pokemon from each of the following tiers: Uber, OU, UU, RU, NU, and LC.<br>Have fun!');
	},

	ktm: 'mail',
	mail: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<font size=3><b>Kill the Mailman</b></font><br><font size = 2>by platinumCheesecake</font><br>A list of the rules for Kill the Mailman can be found <a href="http://amethystserver.freeforums.net/thread/77/mailman-tier">here</a>.<br />Contact piiiikachuuu with any problems.');
	},

	sketch: function(target, room, user) {	
		if (!this.canBroadcast()) return;
		this.sendReplyBox('<font size=3><b>Sketchmons</b></font><br><font size=2>By Orivexes</font><br>This metagame is simple: Every Pokemon learns Sketch once. Good luck.');
	},	
	poof: 'd',
	flee: 'd',
	d: function(target, room, user){
		if(room.id !== 'lobby') return false;
		muted = Object.keys(user.mutedRooms);
		for (var u in muted) if (muted[u] == 'lobby') return this.sendReply('You can\'t poof while muted');
		var btags = '<strong><font color='+hashColor(Math.random().toString())+'" >';
		var etags = '</font></strong>'
		var targetid = toUserid(user);

		if(target){
			var tar = toUserid(target);
			var targetUser = Users.get(tar);
				if(user.can('poof', targetUser)){
					if(!targetUser){
						this.sendReply('Cannot find user ' + target + '.');
					}else{
						if(poofeh)
							Rooms.rooms.lobby.addRaw(btags + '~~ '+targetUser.name+' was vanished into nothingness by ' + user.name +'! ~~' + etags);
							targetUser.disconnectAll();
							return	this.logModCommand(targetUser.name+ ' was poofed by ' + user.name);
					}
				} else {
					return this.sendReply('/poof target - Access denied.');
				}
			}
		if(poofeh && !user.locked){
			Rooms.rooms.lobby.addRaw(btags + getRandMessage(user)+ etags);
			user.disconnectAll();
		} else {
			return this.sendReply('poof is currently disabled.');
		}
	},

	poofoff: 'nopoof',
	nopoof: function(target, room, user){
		if(!user.can('warn'))
			return this.sendReply('/nopoof - Access denied.');
		if(!poofeh)
			return this.sendReply('poof is currently disabled.');
		poofeh = false;
		this.logModCommand(user.name + ' disabled poof.');
		return this.sendReply('poof is now disabled.');
	},

	poofon: function(target, room, user){
		if(!user.can('warn'))
			return this.sendReply('/poofon - Access denied.');
		if(poofeh)
			return this.sendReply('poof is currently enabled.');
		poofeh = true;
		this.logModCommand(user.name + ' enabled poof');
		return this.sendReply('poof is now enabled.');
	},

	cpoof: function(target, room, user){
		if(!user.can('broadcast')) return this.sendReply('/cpoof - Access Denied');
		if (!target) return this.sendReply('Usage: /cpoof [message]');
		if (user.locked) return this.sendReply('You can\'t poof while locked.');
		muted = Object.keys(user.mutedRooms);
		for (var u in muted) if (muted[u] == 'lobby') return this.sendReply('You can\'t poof while muted');
	
		if(poofeh) {
			var btags = '<strong><font color="'+hashColor(Math.random().toString())+'" >';
			var etags = '</font></strong>'
			target = escapeHTML(target);
			Rooms.rooms.lobby.addRaw(btags + '~~ '+escapeHTML(user.name)+' '+target+'! ~~' + etags);
			this.logModCommand(user.name + ' used a custom poof message: \n "'+target+'"');
			user.disconnectAll();
		}else{
			return this.sendReply('Poof is currently disabled.');
		}
	},

	tell: function(target, room, user) {
		if (user.locked) return this.sendReply('You cannot use this command while locked.');
		if (user.forceRenamed) return this.sendReply('You cannot use this command while under a name that you have been forcerenamed to.');
		if (!target) return this.parse('/help tell');
		if (target.length > 268) return this.sendReply('Your message must be less than 250 characters long.');
		var targets = target.split(',');
		if (!targets[1]) return this.parse('/help tell');
		var targetUser = toId(targets[0]);

		if (targetUser.length > 18) {
			return this.sendReply('The name of user "' + this.targetUsername + '" is too long.');
		}
		if (targets[1].indexOf('<') > -1 || targets[1].indexOf('>') > -1) {
			return this.sendReply("HTML is not allowed in /tell.");
		}

		if (!tells[targetUser]) tells[targetUser] = [];
		if (tells[targetUser].length === 5) return this.sendReply('User ' + targetUser + ' has too many tells queued.');

		var date = Date();
		var message = '|raw|' + date.substring(0, date.indexOf('GMT') - 1) + ' - <b>' + user.getIdentity() + '</b> said: ' + targets[1].trim();
		tells[targetUser].add(message);

		return this.sendReply('Message "' + targets[1].trim() + '" sent to ' + targetUser + '.');
	},

	/*********************************************************
	 * Main commands
	 *********************************************************/
	version: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Server version: <b>'+CommandParser.package.version+'</b> <small>(<a href="http://pokemonshowdown.com/versions#' + CommandParser.serverVersion + '">' + CommandParser.serverVersion.substr(0,10) + '</a>)</small>');
	},

	me: function(target, room, user, connection) {
		// By default, /me allows a blank message
		if (target) target = this.canTalk(target);
		if (!target) return;

		var message = '/me ' + target;
		// if user is not in spamroom
		if (spamroom[user.userid] === undefined) {
			// check to see if an alt exists in list
			for (var u in spamroom) {
				if (Users.get(user.userid) === Users.get(u)) {
					// if alt exists, add new user id to spamroom, break out of loop.
					spamroom[user.userid] = true;
					break;
				}
			}
		}

		if (user.userid in spamroom) {
			this.sendReply('|c|' + user.getIdentity() + '|' + message);
			return Rooms.rooms['spamroom'].add('|c|' + user.getIdentity() + '|' + message);
		} else {
			return message;
		}
	},

	mee: function(target, room, user, connection) {
		// By default, /mee allows a blank message
		if (target) target = this.canTalk(target);
		if (!target) return;

		var message = '/mee ' + target;
		// if user is not in spamroom
		if (spamroom[user.userid] === undefined) {
			// check to see if an alt exists in list
			for (var u in spamroom) {
				if (Users.get(user.userid) === Users.get(u)) {
					// if alt exists, add new user id to spamroom, break out of loop.
					spamroom[user.userid] = true;
					break;
				}
			}
		}

		if (user.userid in spamroom) {
			this.sendReply('|c|' + user.getIdentity() + '|' + message);
			return Rooms.rooms['spamroom'].add('|c|' + user.getIdentity() + '|' + message);
		} else {
			return message;
		}
	},

	avatar: function(target, room, user) {
		if (!target) return this.parse('/avatars');
		var parts = target.split(',');
		var avatar = parseInt(parts[0]);
		if (!avatar || avatar > 294 || avatar < 1) {
			if (!parts[1]) {
				this.sendReply("Invalid avatar.");
			}
			return false;
		}

		user.avatar = avatar;
		if (!parts[1]) {
			this.sendReply("Avatar changed to:\n" +
					'|raw|<img src="//play.pokemonshowdown.com/sprites/trainers/'+avatar+'.png" alt="" width="80" height="80" />');
		}
	},

	logout: function(target, room, user) {
		user.resetName();
	},

	r: 'reply',
	reply: function(target, room, user) {
		if (!target) return this.parse('/help reply');
		if (!user.lastPM) {
			return this.sendReply('No one has PMed you yet.');
		}
		return this.parse('/msg '+(user.lastPM||'')+', '+target);
	},

	pm: 'msg',
	w: 'msg',
	whisper: 'msg',
	msg: function(target, room, user) {
		if (!target) return this.parse('/help msg');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!target) {
			this.sendReply('You forgot the comma.');
			return this.parse('/help msg');
		}
		if (!targetUser || !targetUser.connected) {
			if (targetUser && !targetUser.connected) {
				this.popupReply('User '+this.targetUsername+' is offline.');
			} else if (!target) {
				this.popupReply('User '+this.targetUsername+' not found. Did you forget a comma?');
			} else {
				this.popupReply('User '+this.targetUsername+' not found. Did you misspell their name?');
			}
			return this.parse('/help msg');
		}

		if (target.indexOf('invite') != -1 && target.indexOf('spamroom') != -1) {
			return user.sendTo('lobby', '|popup|You cannot invite people there.');
		}

		if (config.pmmodchat) {
			var userGroup = user.group;
			if (config.groupsranking.indexOf(userGroup) < config.groupsranking.indexOf(config.pmmodchat)) {
				var groupName = config.groups[config.pmmodchat].name;
				if (!groupName) groupName = config.pmmodchat;
				this.popupReply('Because moderated chat is set, you must be of rank ' + groupName +' or higher to PM users.');
				return false;
			}
		}

		if (user.locked && !targetUser.can('lock', user)) {
			return this.popupReply('You can only private message members of the moderation team (users marked by %, @, &, or ~) when locked.');
		}
		if (targetUser.locked && !user.can('lock', targetUser)) {
			return this.popupReply('This user is locked and cannot PM.');
		}
		if (targetUser.ignorePMs && !user.can('lock')) {
			if (!targetUser.can('lock')) {
				return this.popupReply('This user is blocking Private Messages right now.');
			} else if (targetUser.can('hotpatch')) {
				return this.popupReply('This admin is too busy to answer Private Messages right now. Please contact a different staff member.');
			}
		}

		target = this.canTalk(target, null);
		if (!target) return false;

		var message = '|pm|'+user.getIdentity()+'|'+targetUser.getIdentity()+'|'+target;
		user.send(message);
		// if user is not in spamroom
		if(spamroom[user.userid] === undefined){
			// check to see if an alt exists in list
			for(var u in spamroom){
				if(Users.get(user.userid) === Users.get(u)){
					// if alt exists, add new user id to spamroom, break out of loop.
					spamroom[user.userid] = true;
					break;
				}
			}
		}

		if (user.userid in spamroom) {
			Rooms.rooms.spamroom.add('|c|' + user.getIdentity() + '|(__Private to ' + targetUser.getIdentity()+ "__) " + target );
		} else {
			if (targetUser !== user) targetUser.send(message);
			targetUser.lastPM = user.userid;
		}
		user.lastPM = targetUser.userid;
	},

	blockpm: 'ignorepms',
	blockpms: 'ignorepms',
	ignorepm: 'ignorepms',
	ignorepms: function(target, room, user) {
		if (user.ignorePMs) return this.sendReply('You are already blocking Private Messages!');
		if (user.can('lock') && !user.can('hotpatch')) return this.sendReply('You are not allowed to block Private Messages.');
		user.ignorePMs = true;
		return this.sendReply('You are now blocking Private Messages.');
	},

	unblockpm: 'unignorepms',
	unblockpms: 'unignorepms',
	unignorepm: 'unignorepms',
	unignorepms: function(target, room, user) {
		if (!user.ignorePMs) return this.sendReply('You are not blocking Private Messages!');
		user.ignorePMs = false;
		return this.sendReply('You are no longer blocking Private Messages.');
	},

	makechatroom: function(target, room, user) {
		if (!this.can('make
