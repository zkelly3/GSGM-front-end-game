var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'GSGM',
  password: 'gsgm',
  database: 'GSGM'
});

var db = {
    /* wrap */
    connect: function(){
        return new Promise(function(resolve, reject){
            connection.connect((err)=>{
                if(err){
                    console.error('error connecting: '+err.stack);
                    reject(err);
                }
                resolve();
            });
        });
    },
    query: function(query_str, params){
        return new Promise(function(resolve, reject){
            connection.query(query_str, params, 
                function(error, results, fields){
                    if(error){
                        console.error(error);
                        reject(error);
                        return;
                    }
                    resolve(results, fields);
            });
        });
    },
    getGameInfo: function(GID){
        return db.query('SELECT initSID, name, width, height FROM game WHERE GID=?;', [GID])
            .then(function(results, fields){
                return results[0];
            });
    },
    getScene: function(SID){
        return Promise.all([db.getSceneInfo(SID), db.getSceneMap(SID), db.getSceneItem(SID)])
            .then(function(data){
                return data;
            });
    },
    getSceneInfo: function(SID){
        return db.query('SELECT name, img, AID FROM scene WHERE SID=?;', [SID])
            .then(function(results, fields){
                return results[0];
            });
    },
    getSceneMap: function(SID){
        return db.query('SELECT id, shape, coords, AID FROM scene_map WHERE SID=?;', [SID])
            .then(function(results, fields){
                return results;
            });
    },
    getSceneItem: function(SID){
        return db.query('SELECT id, x, y, AID, imgurl FROM scene_items WHERE SID=?;', [SID])
            .then(function(results, fields){
                return results;
            });
    },
    getActionData: function(AID){
        return db.query('SELECT act_data FROM action WHERE AID=?;', [AID])
            .then(function(results, fields){
                return results[0].act_data;
            })
            .then(function(action){
                return db.findRoot(action);
            });
    },
    getMapAction: function(id){
        return db.query('SELECT AID FROM scene_map WHERE id=?;', [id])
            .then(function(results,fields){
                var AID = parseInt(results[0].AID);
                if(isNaN(AID) || AID==0){
                    return '[]';
                }
                else{
                    return db.getActionData(AID);
                }
            });
    },
    getItemAction: function(id){
        return db.query('SELECT AID FROM scene_items WHERE id=?;', [id])
            .then(function(results, fields){
                var AID = parseInt(results[0].AID);
                if(isNaN(AID) || AID==0){
                    return '[]';
                }
                else{
                    return db.getActionData(AID);
                }
            });
    },
    findRoot: function(action){
        var actdata = JSON.parse(action);
        var type = actdata.type;
        if(type!='use'){
            return action;
        }
        if(actdata.tname=='map'){
            db.getMapAction(actdata.id)
                .then(function(data){
                    return db.findRoot(data);
                });
        }
        else if(actdata.tname=='item'){
            db.getItemAction(actdata.id)
                .then(function(data){
                    return db.findRoot(data);
                });
        }
        else{
            return '[]';
        }
    }
}
module.exports = db;