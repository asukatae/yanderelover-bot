const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
var LinkedList = require('singly-linked-list');

var list = new LinkedList(); 
var listDM=new LinkedList(); 
var listIfVoted = new LinkedList(); 

var suspects = new LinkedList();
var votes = new LinkedList();

var x;
var y;
var z;

var charmer;
var killerClassmate;
var killerTeacher;
var lover;
var deadPersonC;
var deadPersonT;

var idCharmer;
var idKillerClassmate;
var idKillerTeacher;


var alreadyPressPlay=false;
var alreadyDate= false;
var alreadyChooseWeaponC=false;
var alreadyChooseWeaponT=false;
var alreadyKillC=false;
var alreadyKillT=false;


var weaponC=null;
var weaponT=null;

var sTime;
var counter;
var countDownVote = 60;
var gameCont= false;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

  var content = msg.content //contains all the text Ex: !addrole Member
  var parts = content.split(" "); //splits everything up on spaces so you'll have an array of two strings
  
  if (msg.isMentioned(client.user)) {
    msg.channel.send('Welcome to a game of dating murder mystery!\nCommands:\n`y!rules` `y!join` `y!play` `y!quit` `y!about`');
  }

  if (msg.content === config.prefix  + '!' + 'rules') {
	msg.channel.send('Everybody wants to date **The Charmer**, but not everyone can. In each round, **The Charmer** chooses someone to date. However, there are two killers who love **The Charmer** and they can choose to kill whomever they wish except for her. If **The Charmer**’s lover dies, she will be forced to find another lover. Everyone votes who they think is the killer and puts him behind bars. The game ends when **The Charmer** has one last person to date, or if the killers are both dead or locked away.');

	/*
   msg.channel.send("This is the murder weapon", {
    file: "http://s3files.core77.com/blog/images/2014/06/0toiletclogs003.jpg" // Or replace with FileOptions object
  });
  */
  }

  if (msg.content === config.prefix  + '!' + 'join') {
    join(msg);
  }

  if (msg.content === config.prefix  + '!' + 'play') {
    if(checkEnoughPeople(msg)){
      play(msg);
    }
    else{
     msg.channel.send('We don\'t have enough people to play the game. We need at least 4 people.');
    }
  }
  if (msg.content === config.prefix  + '!' + 'quit') {
    clearAll();
    msg.channel.send('Game restart.');
  }
  if (msg.content === config.prefix  + '!' + 'about') {
    msg.channel.send('This is a bot concepualized by CrimsonZeye and Asuka Tae (飛鳥 妙) in August 2017! Thank you for playing!');
  }

  if(parts[0] === config.prefix  + '!' + 'date'){
    if (msg.author.toString() === charmer){
      if(alreadyDate==false){
        chooseBoyfriend(msg, parts[1]);
        if(alreadyDate== true){
          if(killerClassmate!=null){
            client.channels.get('352403126940336129').send('...and Killer Kindergaten Classmate is awake! DM me who you want to kill.');
            client.fetchUser(idKillerClassmate).then(user => {user.send("The people alive are:\n"+ listDM.printDMList() +"\nTo kill, use y!killC number, ie. y!killC 0")});
          }else{
            client.channels.get('352403126940336129').send('...and Killer Homeroom Teacher is awake! DM me who you want to kill.');
            client.fetchUser(idKillerTeacher).then(user => {user.send("The people alive are:\n"+ listDM.printDMList() +"\nTo kill, use y!killT number, ie. y!killT 0")});
          }
        }   
      }else{
        msg.channel.send('You\'ve already dated once.');
      }
    }else{
    msg.channel.send('You are not authorized with this command.');
    }
  }
  if(parts[0] === config.prefix  + '!' + 'weaponC'){
    if (msg.author.toString() === killerClassmate){
      if(alreadyChooseWeaponC==false){
        chooseWeaponC(msg, parts[1]);
        if(alreadyChooseWeaponC== true){
          msg.channel.send('Your weapon of choice is the '+weaponC);
        }   
      }else{
        msg.channel.send('You\'ve already chosen your weapon once.');
      }
    }else{
    msg.channel.send('You are not authorized with this command.');
    }
  }
  if(parts[0] === config.prefix  + '!' + 'weaponT'){
    if (msg.author.toString() === killerTeacher){
      if(alreadyChooseWeaponT==false){
        chooseWeaponT(msg, parts[1]);
        if(alreadyChooseWeaponT== true){
          msg.channel.send('Your weapon of choice is the '+weaponT);
        }   
      }else{
        msg.channel.send('You\'ve already chosen your weapon once.');
      }
    }else{
    msg.channel.send('You are not authorized with this command.');
    }
  }
  
  if(parts[0] === config.prefix  + '!' + 'killC'){
    if (msg.author.toString() === killerClassmate){
      if(alreadyKillC==false){
      noteDeadC(msg, parts[1]);
      if(alreadyKillC== true){
        if (list.contains(killerTeacher)){
          client.channels.get('352403126940336129').send('...and Killer Homeroom Teacher is awake! DM me who you want to kill.');
          client.fetchUser(idKillerTeacher).then(user => {user.send("The people alive are:\n"+ listDM.printDMList() +"\nTo kill, use y!killT number, ie. y!killT 0")});
        }else{ //teacher is dead

        }
      }   
      }else{
        msg.channel.send('You\'ve already killed once.');
      }
    }else{
    msg.channel.send('You are not authorized with this command.');
    }
  }

  if(parts[0] === config.prefix  + '!' + 'killT'){
    if (msg.author.toString() === killerTeacher){
      if(alreadyKillT==false){
        noteDeadT(msg, parts[1]);
        if(alreadyKillT== true){
          //assuming that both killers are alive
          if (deadPersonC===deadPersonT){
              client.channels.get('352403126940336129').send('It’s daytime, wakey wakey! '+ list.findAt(deadPersonC).getData() +' has been found slaughtered with a ' +weaponC+ 'and a '+weaponT);
              removePersonfromLists(deadPersonC);
              client.channels.get('352403126940336129').send('Alive: '+ list.printList() +'\nWho is the killer? Please vote with y!vote @username');
                         while (!gameCont){
                          sTime = new Date().getTime();
                          counter = setInterval(function(){waitVote(msg)}, 500);
                          gameCont=true;
                        }
          }else{
              client.channels.get('352403126940336129').send('It’s daytime, wakey wakey! \n'+ list.findAt(deadPersonC).getData() +' has been found slaughtered with a ' +weaponC+' and ' + list.findAt(deadPersonT).getData() +' has been found slaughtered with a ' +weaponT);
              
              var deadTID = list.findAt(deadPersonT).getData();
              removePersonfromLists(deadPersonC);
              var indexT = list.indexOf(deadTID);
              removePersonfromLists(indexT);

              if(list.getSize()==2){
                //game over
                var indexCharmer = list.indexOf(charmer);
                if(indexCharmer==0){
                  if(list.findAt(1).getData()==killerClassmate){
                    client.channels.get('352403126940336129').send(charmer +' and ' + list.findAt(1).getData()+' live happily ever after... except '+list.findAt(1).getData()+ ' is revealed to be Killer Kindergarten Classmate!');
                    client.channels.get('352403126940336129').send('Killer Kindergarten Classmate '+list.findAt(1).getData()+' has won the game!');
                  }else if(list.findAt(1).getData()==killerTeacher){
                    client.channels.get('352403126940336129').send(charmer +' and ' + list.findAt(1).getData()+' live happily ever after... except '+list.findAt(1).getData()+ ' is revealed to be Killer Homeroom Teacher!');
                    client.channels.get('352403126940336129').send('Killer Homeroom Teacher '+list.findAt(1).getData()+' has won the game!');
                  }
                  else{
                    client.channels.get('352403126940336129').send(charmer +' and ' + list.findAt(1).getData()+' live... happily ever after!');
                    client.channels.get('352403126940336129').send('Normal guy '+list.findAt(1).getData()+' and '+ charmer +' has won the game!');
                  }
                  

                }else{
                  if(list.findAt(0).getData()==killerClassmate){
                    client.channels.get('352403126940336129').send(charmer +' and ' + list.findAt(0).getData()+' live happily ever after... except '+list.findAt(0).getData()+ ' is revealed to be Killer Kindergarten Classmate!');
                    client.channels.get('352403126940336129').send('Killer Kindergarten Classmate '+list.findAt(0).getData()+' has won the game!');
                  }else if(list.findAt(0).getData()==killerTeacher){
                    client.channels.get('352403126940336129').send(charmer +' and ' + list.findAt(0).getData()+' live happily ever after... except '+list.findAt(0).getData()+ ' is revealed to be Killer Homeroom Teacher!');
                    client.channels.get('352403126940336129').send('Killer Homeroom Teacher '+list.findAt(0).getData()+' has won the game!');
                  }
                  else{
                    client.channels.get('352403126940336129').send(charmer +' and ' + list.findAt(0).getData()+' live... happily ever after!');
                    client.channels.get('352403126940336129').send('Normal guy '+list.findAt(0).getData()+' and '+ charmer +' has won the game!');
                  }

                }

                clearAll();
                client.channels.get('352403126940336129').send("Press y!join and y!play to play the game again.");
              }else{
                client.channels.get('352403126940336129').send('Alive: '+ list.printList() +'\nWho is the killer? Please vote with y!vote @username');
                        while (!gameCont){
                          sTime = new Date().getTime();
                          counter = setInterval(function(){waitVote(msg)}, 500);
                          gameCont=true;
                        }
              }
              
              
          }
          
        }   
      }else{
        msg.channel.send('You\'ve already killed once.');
      }
    }else{
    msg.channel.send('You are not authorized with this command.');
    }
  }
  if(parts[0] === config.prefix  + '!' + 'vote'){
    if (list.contains(msg.author.toString())){ 
      vote(msg, parts[1]);
    }else{
      msg.reply('You are not playing in the game. Press w!join to vote.');
    }

  }






});

function join(msg){

  if(list.contains(msg.author.toString())){
    msg.reply('You\'ve already joined');
  }
  //if it's Tensai
  else if('<@85614143951892480>'=== msg.author.toString()){
    console.log(`Tensai tried to join the game`);
  }
  else{
    list.insert(msg.author.toString());
    listDM.insert(msg.author.tag);
  }
  client.channels.get('352403126940336129').send('Players: ' + list.printList());
}

function checkEnoughPeople(msg){
  if (list.getSize()>=4){
    return true;
  }
  else{
    return false;
  } 
    
} 

function play(msg){
  if (alreadyPressPlay==false){
    alreadyPressPlay=true;
    client.channels.get('352403126940336129').send('Everybody loves **The Charmer**, but not everyone can date him/her. This is his/her dating adventure.');
    assignRoles();
  }else{
    client.channels.get('352403126940336129').send('Game already started');
  }
} 

function assignRoles(){

  x = Math.floor(Math.random() * list.getSize()) ;
  charmer= list.findAt(x).getData();
  console.log( charmer +` is charmer!`);
  let strCharmer = charmer; 
  idCharmer= strCharmer.replace(/[<@!>]/g, '');
  client.channels.get('352403126940336129').send(charmer+' is **The Charmer**. Charmer, choose someone to date using y!date @username');
  
  y = Math.floor(Math.random() * list.getSize()) ;
  
  while(x==y){
    y = Math.floor(Math.random() * list.getSize()) ;
  }
  if (x!=y){
    killerClassmate = list.findAt(y).getData();
    console.log( killerClassmate+` is the killerClassmate!`);
    let strKillerClassmate = killerClassmate; 
    idKillerClassmate = strKillerClassmate.replace(/[<@!>]/g, '');
    client.fetchUser(idKillerClassmate).then(user => {user.send("You are Killer Kindergaten Classmate! Choose your weapon by entering y!weaponC emoji of choice, ie y!weaponC :knife:")});
  }

  z = Math.floor(Math.random() * list.getSize()) ;
  while((x==z) || (y==z)){
    z = Math.floor(Math.random() * list.getSize()) ;
  }

  if ((x!=z) && (y!=z)){
    killerTeacher = list.findAt(z).getData();
    console.log( killerTeacher +` is the killerTeacher!`);
    let strKillerTeacher= killerTeacher; //Just assuming some random tag.
    idKillerTeacher= strKillerTeacher.replace(/[<@!>]/g, '');
    client.fetchUser(idKillerTeacher).then(user => {user.send("You are Killer Homeroom Teacher! Choose your weapon by entering y!weaponT emoji of choice, ie y!weaponT :knife:")});
  }
}
function chooseBoyfriend(msg, lvr){
  if(lvr===charmer){
    msg.channel.send('You cannot date yourself. Please y!date @username again.');
  }else if(!list.contains(lvr)){
    msg.reply('You just chose to date a dead person or someone outside the game. Type y!date username again.');
  }else{
    lover=lvr;
    alreadyDate=true;
    client.channels.get('352403126940336129').send('**The Charmer** '+charmer+ ' :heart: ' + lover+'. Night falls...');
  }
}
function chooseWeaponC(msg, weapon){
  if (weapon==null){
    msg.channel.send('You forgot to use an emoji. Try again with y!weaponC emoji, ie y!weaponC :knife:');
  }else{
    weaponC=weapon;
    alreadyChooseWeaponC=true;
  }
}
function chooseWeaponT(msg, weapon){
  if (weapon==null){
    msg.channel.send('You forgot to use an emoji. Try again with y!weaponT emoji, ie y!weaponT :knife:');
  }else{
    weaponT=weapon;
    alreadyChooseWeaponT=true;
  }
}
function noteDeadC(msg, dead){
  if(list.findAt(dead).getData()===killerClassmate){
    msg.channel.send('Suicide is a bad option. Please y!killC number again.');
  }else if(list.findAt(dead).getData()===charmer){
    msg.channel.send('Don\'t kill your crush! Please y!killC number again.');
  }else if (dead<list.getSize()){
    deadPersonC= dead;
    alreadyKillC=true;
    msg.channel.send("You have killed " + listDM.findAt(deadPersonC).getData());
  }else{
    msg.channel.send("Unvalid number! Please y!killC number again.");
  }
}
function noteDeadT(msg, dead){
  if(list.findAt(dead).getData()===killerTeacher){
    msg.channel.send('Suicide is a bad option. Please y!killT number again.');
  }else if(list.findAt(dead).getData()===charmer){
    msg.channel.send('Don\'t kill your crush! Please y!killT number again.');
  }else if (dead<list.getSize()){
    deadPersonT= dead;
    alreadyKillT=true;
    msg.channel.send("You have killed " + listDM.findAt(deadPersonT).getData());
  }else{
    msg.channel.send("Unvalid number! Please y!killT number again.");
  }
}
function removePersonfromLists(dead){
  if (dead==0){
    list.removeFirst(); 
    listDM.removeFirst();
  }else{
    list.removeAt(dead);  
    listDM.removeAt(dead);
  }
}

function waitVote(msg) {
  var cTime = new Date().getTime();
    var diff = cTime - sTime;
    var seconds = countDownVote - Math.floor(diff / 1000);
    console.log(seconds);
    if(seconds<0){
      clearInterval(counter);
      var personWithMostVotes=findPersonWithMostVotes(msg);
      
      client.channels.get('352403126940336129').send('Time is up! \nDuring the day, the students locked away '+ suspects.findAt(personWithMostVotes).getData()+'. \nNight falls...');
    var index = list.indexOf(suspects.findAt(personWithMostVotes).getData());
      if (index==0){
        list.removeFirst();
      listDM.removeFirst();
    }else{
      list.removeAt(index);
      listDM.removeAt(index);
    }

    
      if(list.getSize()==2){
                //game over
                var indexCharmer = list.indexOf(charmer);
                if(indexCharmer==0){
                  if(list.findAt(1).getData()==killerClassmate){
                    client.channels.get('352403126940336129').send(charmer +' and ' + list.findAt(1).getData()+' live happily ever after... except '+list.findAt(1).getData()+ ' is revealed to be Killer Kindergarten Classmate!');
                    client.channels.get('352403126940336129').send('Killer Kindergarten Classmate '+list.findAt(1).getData()+' has won the game!');
                  }else if(list.findAt(1).getData()==killerTeacher){
                    client.channels.get('352403126940336129').send(charmer +' and ' + list.findAt(1).getData()+' live happily ever after... except '+list.findAt(1).getData()+ ' is revealed to be Killer Homeroom Teacher!');
                    client.channels.get('352403126940336129').send('Killer Homeroom Teacher '+list.findAt(1).getData()+' has won the game!');
                  }
                  else{
                    client.channels.get('352403126940336129').send(charmer +' and ' + list.findAt(1).getData()+' live... happily ever after!');
                    client.channels.get('352403126940336129').send('Normal guy '+list.findAt(1).getData()+' and '+ charmer +' has won the game!');
                  }
                  

                }else{
                  if(list.findAt(0).getData()==killerClassmate){
                    client.channels.get('352403126940336129').send(charmer +' and ' + list.findAt(0).getData()+' live happily ever after... except '+list.findAt(0).getData()+ ' is revealed to be Killer Kindergarten Classmate!');
                    client.channels.get('352403126940336129').send('Killer Kindergarten Classmate '+list.findAt(0).getData()+' has won the game!');
                  }else if(list.findAt(0).getData()==killerTeacher){
                    client.channels.get('352403126940336129').send(charmer +' and ' + list.findAt(0).getData()+' live happily ever after... except '+list.findAt(0).getData()+ ' is revealed to be Killer Homeroom Teacher!');
                    client.channels.get('352403126940336129').send('Killer Homeroom Teacher '+list.findAt(0).getData()+' has won the game!');
                  }
                  else{
                    client.channels.get('352403126940336129').send(charmer +' and ' + list.findAt(0).getData()+' live... happily ever after!');
                    client.channels.get('352403126940336129').send('Normal guy '+list.findAt(0).getData()+' and '+ charmer +' has won the game!');
                  }

                }

                clearAll();
                client.channels.get('352403126940336129').send("Press y!join and y!play to play the game again.");
              }
      else{
      client.channels.get('352403126940336129').send("... and the werewolf is awake!\nWerewolf, please DM me who you want to kill.");
      client.fetchUser(idWerewolf).then(user => {user.send("The people alive are: \n" + listDM.printDMList() + "\nTo kill, use w!kill number, ie. w!kill 0")});
      continueGame();
      }


  
    }
}
function vote(msg, vote){
  if(!listIfVoted.contains(msg.author.toString())){
    if (list.contains(vote)){ //if suspect is alive
      if(suspects.contains(vote)){ //if suspect has been suspected before
        var index= suspects.indexOf(vote);
        var num = votes.findAt(index).getData();
        votes.findAt(index).editData(num+1);
        msg.channel.send(vote+" +" +votes.findAt(index).getData());
        listIfVoted.insert(msg.author.toString());
      }else{ //if suspect is casted first vote
        suspects.insert(vote);
        votes.insert(1);
        msg.channel.send(vote+" +1");
          listIfVoted.insert(msg.author.toString());
      }
    }else{
      msg.channel.send('You probably tried to vote for a dead person or someone outside the game.\nTry w!vote @username again.');
    }
  }else{
    msg.reply('You already voted once.');
  }
}
function findPersonWithMostVotes(msg){
  var maxIndex=0;
  var max= votes.findAt(0).getData();


  if (suspects.getSize()==1){
    return 0;

  }else{

      for (var i = 1; i < suspects.getSize(); i++) {
          if (votes.findAt(i).getData() > max) {
              maxIndex = i;
              max = votes.findAt(i).getData();
          }
      }
  }

  return maxIndex;
}
function clearAll(){

list.clear(); 
listDM.clear(); 
listIfVoted.clear(); 

suspects.clear();
votes.clear();

x=-1;
y=-1;
z=-1;

charmer="";
killerClassmate="";
killerTeacher="";
lover="";
deadPersonC=-1;
deadPersonT=-1;

idCharmer="";
idKillerClassmate="";
idKillerTeacher="";


alreadyPressPlay=false;
alreadyDate= false;
alreadyChooseWeaponC=false;
alreadyChooseWeaponT=false;
alreadyKillC=false;
alreadyKillT=false;


weaponC=null;
weaponT=null;


gameCont= false;

}

client.login(config.token);
