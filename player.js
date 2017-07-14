function Player(session) {
    this.game_data = session;
}

Player.prototype.run = function(actions, f_actions){
    for(let i in actions){
        if(actions[i].type=='msg'){
            f_actions.push({
                type: 'message',
                speaker: actions[i].speaker,
                content: actions[i].msg
            });
        }
        else if(actions[i].type=='scene'){
            this.game_data.nowScene = actions[i].SID;
            f_actions.push({
                type: 'scene',
                SID: actions[i].SID
            });
        }
        else if(actions[i].type=='get'){
            this.game_data.item[actions[i].item] = true;
        }
        else if(actions[i].type=='lose'){
            delete this.game_data.item[actions[i].item];
        }
        else if(actions[i].type=='flag'){
            this.game_data.progress[actions[i].flag] = true;
        }
        else if(actions[i].type=='ifelse'){
            var len = actions[i].cases.length;
            var iselse = true;
            for(let j=0;j<len-1;j++){
                var alland = true;
                var acase = actions[i].cases[j];
                for(let k in acase.cond){
                    var condition = acase.cond[k];
                    if((condition.type=='item' && this.game_data.item[condition.value]==true) || (condition.type=='progress' && this.game_data.progress[condition.value]==true)){
                    }
                    else{
                        alland = false;
                        break;
                    }
                }
                if(alland){
                    this.run(acase.act, f_actions);
                    iselse = false;
                    break;
                }
            }
            if(iselse){
                this.run(actions[i].cases[len-1].act, f_actions);
            }
        }
    }
}  

module.exports = Player;