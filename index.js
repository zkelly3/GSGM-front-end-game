const fs = require('fs');
const path = require('path');
const vm = require('vm');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const db = require('./database');
const Player = require('./player');

const app = express();

/* Middlewares */
app.use('/static', express.static(__dirname + '/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'pusheen',
    cookie: {}
}));

app.use(function(req, res, next) {
    if (!req.session.game) {
        req.session.game = {};
        
    }
    next();
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* Routes */
app.get('/game/:GID', function(req, res) {
    if(!req.session.game[req.params.GID]){
        db.getGameInfo(req.params.GID)
            .then(function(gameInfo) {
                if(typeof(gameInfo)=='undefined'){
                    res.sendStatus(404);
                }
                else{
                    req.session.game[req.params.GID] = {item:{}, progress:{}};
                    req.session.game[req.params.GID].nowScene = gameInfo.initSID;
                    res.render('GM_back', {
                        GID: req.params.GID,
                        game: gameInfo,
                        nowScene: req.session.game[req.params.GID].nowScene
                    });
                }
            });
    }
    else{
        db.getGameInfo(req.params.GID)
            .then(function(gameInfo) {
                res.render('GM_back', {
                    GID: req.params.GID,
                    game: gameInfo,
                    nowScene: req.session.game[req.params.GID].nowScene
                });
            });
    }
});

app.post('/game/:GID/scene/:SID/action/:AID', function(req, res) {
    var player = new Player(req.session.game[req.params.GID]);
    console.log(req.session.game[req.params.GID]);
    db.getActionData(req.params.AID)
        .then(function(str) {
            var actions = JSON.parse(str);
            var f_actions = [];
            player.run(actions, f_actions);
            console.log(f_actions);
            res.json(f_actions);
        });
});

app.get('/game/:GID/scene/:SID', function(req, res) {
    var SID = req.params.SID;
    var scene = {}
    db.getScene(SID)
        .then(function(data){
            scene.img = data[0].img;
            scene.name = data[0].name;
            var map = data[1];
            for(let i in map){
                var coords = JSON.parse(map[i].coords);
                map[i].coords = coords2Str(coords);
            }
            scene.map = map;
            scene.item = data[2];
            scene.AID = data[0].AID;
            res.json(scene);
        });
});

app.post('/game/:GID/noSession', function(req, res) {
    if (req.session.game[req.params.GID]){
        req.session.game[req.params.GID] = null;    
    }
    res.send('Pusheen ate your session!');
});

function coords2Str(coords) {
    var result = "";
    for(var i in coords) {
        if(i!=0) result += ',';
        result += coords[i].x + ',' + coords[i].y;
    }
    return result;
}

/* Start the Server */
db.connect().then(function() {
    app.listen(10002, function(req, res) {
        console.log('listening to 10002!');
    });
});