function Player(session) {
    this.game_data = session;
}

Player.prototype.run = function(actions){
    var f_actions = [];
    for(let i in actions){
        if(actions[i].type=='msg'){
            f_actions.push({
                type: 'message',
                speaker: actions[i].speaker,
                content: actions[i].msg
            });
        }
        else if(actions[i].type=='var'){
            this.game_data.user[actions[i].name] = actions[i].value;
        }
        else if(actions[i].type=='scene'){
            this.game_data.nowScene = actions[i].SID;
            f_actions.push({
                type: 'scene',
                SID: actions[i].SID
            });
        }
    }
    return f_actions;
}  

module.exports = Player;