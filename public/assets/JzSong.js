Jazzy.Entity.Song = function(){};

Jazzy.Entity.Song.prototype = {
};

Jazzy.Entity.extends(Jazzy.Entity.Song,[
    {
        "name"   : "grid",
        "isEntity" : true,
        "type"     : "grid",
        "isArray"  : false,
        "parentName": "song",
    },
    {
        "name"   : "title",
    }
]);
Jazzy.Entity.registerName("song",Jazzy.Entity.Chord);
