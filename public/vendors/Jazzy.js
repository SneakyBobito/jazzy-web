

    /**
 * @license Copyright (c) 2013-2014 Soufiane Ghzal
 * Code under MIT LICENSE
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

    var Jazzy = function($){

        var Jazzy = {};

/**
 * Allows to bind params to an object instance according to the given definition.
 * A definition is the list of the properties of the instance and what should be default values
 * @param instance
 * @param params
 * @param definition
 */
Jazzy.applyParams = function(instance,params,definition){
    params = params || {};
    for( var item in definition ){
        if(definition[item] && definition[item]["kCallback"] !== undefined )
            instance[item] = definition[item]["kCallback"](params[item]) ;
        else
            instance[item] = params[item] || definition[item] ;
    }

};

Jazzy.error = function(message , url){
    var errorMessage = "Jazzy Error : " + message ;
    if( url !== undefined )
        errorMessage += " More informations at : " + url;

    console.log(errorMessage);

};


Jazzy.debug = function(item){
    console.log(item);
};/**
 * @class Bindable
 * make extending class bindable and firable
 */
Jazzy.Bindable = function(){};

Jazzy.Bindable.prototype={

    bind : function(what,how){

        if(!this.bindable_bounds){
            this.bindable_bounds = {};
        }

        if(!this.bindable_bounds[what]){
            this.bindable_bounds[what] = [];
        }

        this.bindable_bounds[what].push(how);

    },

    fire : function(what,params,cancelOnFalse){

        var cancelOnFalse = cancelOnFalse === undefined ? false : cancelOnFalse;

        if(!this.bindable_bounds || !this.bindable_bounds[what]){
            return true;
        }

        for(var i = 0 ; i < this.bindable_bounds[what].length ; i++ ){
            var cR = this.bindable_bounds[what][i].apply(this,params);
            if(cancelOnFalse && cR === false){
                return false;
            }
        }

        return true;

    }

};

Jazzy.Bindable.extends = function (what){

    what.prototype.bind = Jazzy.Bindable.prototype.bind;
    what.prototype.fire = Jazzy.Bindable.prototype.fire;

};/**
 * @class Exception
 */
Jazzy.Exception = function(message){
    console.error(message);
};Jazzy.Entity = function(){};
Jazzy.EntityName = {};

Jazzy.Entity.prototype = {

    export  : function(){

        var exportData = {};


        for(var i in this.creator._iEntities){

            var dataDef = this.creator._iEntities[i];

            var self = this;
            var handler;

            if( dataDef.isEntity === true ){

                handler = function(data){
                    return data.export();
                };

            }else{
                if( typeof dataDef.export === "function" ){
                    handler = function(data){
                        return dataDef.export.call(self,data);
                    };
                }else{
                    handler = function(data){
                        return data;
                    };
                }
            }

            var value;

            if(dataDef.isArray === true){
                value = [];
                for(var ii=0;ii<self[dataDef.name].length;ii++){
                    value.push(handler(self[dataDef.name][ii]));
                }
            }else{
                value = handler(self[dataDef.name]);
            }

            exportData[dataDef.name] = value;
        }
        return exportData;
    },

    afterImport : function(){

    },

    parent : function(name){

        if(undefined == name){
            return this._iParent[Object.keys(this._iParent)[0]];
        }

        if( this._iParent.hasOwnProperty(name)){

            return this._iParent[name];
        }else{
            var p = this.parent();

            if(p){
                return p.parent(name);
            }
        }

        return null;

    },

    setParent : function(name,o){
        this._iParent[name] = o;
    },

    import : function(data){

        for(var i in this.creator._iEntities ){

            var dataDef = this.creator._iEntities[i] ;

            var value = null;

            if( data.hasOwnProperty(dataDef.name) ){
                value = data[dataDef.name];
            }else{
                if(dataDef.default !== undefined  ){
                    value = dataDef.default;
                }
            }


            var handler;
            var self = this;

            if( dataDef.isEntity === true ){

                if(!dataDef.type){
                    Jazzy.error("No type in dataDef. Type is required for import : ");
                    Jazzy.debug(dataDef);
                    continue;
                }

                handler = function(value){
                    var e = Jazzy.createEntity(dataDef.type,value);

                    if( typeof dataDef.parentName == "string"){
                        e.setParent(dataDef.parentName , self);
                    }

                    return e;
                };

            }else{
                if( typeof dataDef.import === "function" ){
                    handler = function(value){
                        return dataDef.import.call(self,value,data);
                    };
                }else{
                    handler = function(value){
                        return value;
                    };
                }
            }

            if(dataDef.isArray === true){
                this[dataDef.name] = [];

                if(value instanceof Array){
                    for(var i = 0 ; i<value.length ; i++){
                        this[dataDef.name].push(handler(value[i]));
                    }
                }

            }else{
                this[dataDef.name] = handler(value);
            }

            this.afterImport();

        }

    },


    addChildHelper : function(data,index,parentName,ElementName,removerMethodName,arrayPropertyName){

        var expectedElementInstance = Jazzy.EntityName[ElementName];

        var e;

        if(data instanceof expectedElementInstance){
            e = data;
            var parent = e.parent(parentName);
            if(parent){
                parent[removerMethodName](e);
            }
        }else
            e = Jazzy.createEntity(ElementName,data);

        if(index)
            this[arrayPropertyName].splice(index,0,e);
        else
            this[arrayPropertyName].push(e);

        e.setParent(parentName,this);

        return e;

    },

    removeChildHelper : function(data,elementName,arrayPropertyName){

        var i = this[arrayPropertyName].indexOf(data);

        if(i >= 0){
            var e = this[arrayPropertyName][i];
            e.setParent(elementName,null);
            this[arrayPropertyName].splice(i,1);

            return e;
        }

        return null;

    }

};

Jazzy.Entity.extends = function (what,entities){
    what.prototype.export  = Jazzy.Entity.prototype.export;
    what.prototype.import  = Jazzy.Entity.prototype.import;
    what.prototype.afterImport  = Jazzy.Entity.prototype.afterImport;
    what.prototype.parent  = Jazzy.Entity.prototype.parent;
    what.prototype.setParent  = Jazzy.Entity.prototype.setParent;
    what.prototype.addChildHelper  = Jazzy.Entity.prototype.addChildHelper;
    what.prototype.removeChildHelper  = Jazzy.Entity.prototype.removeChildHelper;

    Jazzy.Bindable.extends(what);

    what._iEntities = {};

    for(var i = 0 ; i < entities.length ; i++){

        var e = Jazzy.Entity.__parseDataDef(entities[i]);

        if(!e.name){
            Jazzy.error("Entity Data has no name");
            Jazzy.debug(e);
        }

        what._iEntities[e.name] = e;
    }

};

Jazzy.Entity.registerName = function( hName , entity ){
    Jazzy.EntityName[hName] = entity;
};


Jazzy.createEntity = function(name,data){

    var e = new Jazzy.EntityName[name];

    e.creator = Jazzy.EntityName[name];

    e._iParent = {};

    if(data){
        e.import(data);
    }

    return e;
};

Jazzy.Entity.__parseDataDef = function(dataDef){

    var i = {},p;

    if(typeof dataDef === "string"){
        p = {"name" : dataDef};
    }else if(typeof dataDef === "object" ){
        p = dataDef;
    }else{
        Jazzy.error("Bad data definition");
        Jazzy.debug(dataDef);
    }

    Jazzy.applyParams(i,p,{

        name        : undefined,
        import      : null,
        export      : null,
        default     : undefined,
        isEntity    : false,
        isArray     : false,
        type        : undefined,
        parentName  : undefined

    });

    return i;

};Jazzy.Entity.Chord = function(){};

Jazzy.Entity.Chord.prototype = {

    update : function(chordName){


        try{
            var chord = teoria.chord(chordName);
        }catch(e){
            return false;
        }

        var oldChord = this.chord;

        this.chord = chord;

        this.fire("chordUpdated",[this,oldChord]);

        var grid = this.parent("grid");
        if(grid)
            grid.fire("chordUpdated",[this,oldChord]);

        var line = this.parent("line");
        if(line)
            line.fire("chordUpdated",[this,oldChord]);

        var cell = this.parent("cell");
        if(cell)
            cell.fire("chordUpdated",[this,oldChord]);

        return true;


    },

    coordinate : function(){

        var p = this.parent();

        var i = p.chords.indexOf(this);

        var c = p.coordinate();
        c.push(i);
        return c;

    }

};

Jazzy.Entity.extends(Jazzy.Entity.Chord,[

    {
        "name"   : "chord",
        "export" : function(v){
            return  v.name;
        },
        "import" : function(v,d){
            return new teoria.chord(v);
        }
    }
] );
Jazzy.Entity.registerName("chord",Jazzy.Entity.Chord);
Jazzy.Entity.Cell = function(){};

Jazzy.Entity.Cell.prototype = {
    get : function(ichord){

        if(undefined == ichord)
            return this;

        var chord = this.chords[ichord];

        if(undefined == chord)
            return null;
        else
            return chord;

    },

    coordinate : function(){

        var p = this.parent();

        var i = p.cells.indexOf(this);

        var c = p.coordinate();
        c.push(i);
        return c;

    },

    addChord : function(data,index){
        var parentName = "cell";
        var ElementName = "chord";
        var removerMethodName = "removeChord";
        var arrayPropertyName = "chords";

        var chord = this.addChildHelper(data,index,parentName,ElementName,removerMethodName,arrayPropertyName);

        this.fire("chordAdded",[{
            "parent" : this,
            "child"  : chord
        }]);

        var grid = this.parent("grid");
        if(grid)
            grid.fire("chordAdded",[{
                "parent" : this,
                "child"  : chord
            }]);

        var line = this.parent("line");
        if(line)
            line.fire("chordAdded",[{
                "parent" : this,
                "child"  : chord
            }]);

        return chord;

    },

    removeChord : function(data){
        var arrayPropertyName = "chords";
        var elementName = "chord";
        var chord = this.removeChildHelper(data,elementName,arrayPropertyName);

        this.fire("chordRemoved",[{
            "parent" : this,
            "child"  : chord
        }]);

        var grid = this.parent("grid");
        if(grid)
            grid.fire("chordRemoved",[{
                "parent" : this,
                "child"  : chord
            }]);

        var line = this.parent("line");
        if(line)
            line.fire("chordRemoved",[{
                "parent" : this,
                "child"  : chord
            }]);

        return chord;
    }

};


Jazzy.Entity.extends(Jazzy.Entity.Cell,[

    {
        "name" : "chords",
        "isEntity" : true,
        "type"     : "chord",
        "isArray"  : true,
        "parentName": "cell",
    },
    {
        "name" : "pattern",
        "default" : "4",
        "import" : function(v){

            var knownPatterns = [

                "4",
                "2-2",
                "3-1",
                "repeat",
                "2-1-1",
                "1-3",
                "1-1-2",
                "1-1-1-1"

            ];

            if(knownPatterns.indexOf(v) > -1){
                return v;
            }else{
                return "4";
            }

        }
    }

] );



Jazzy.Entity.registerName("cell",Jazzy.Entity.Cell);Jazzy.Entity.Line = function(){};

Jazzy.Entity.Line.prototype = {

    get : function(icell,ichord){

        if(undefined == icell)
            return this;

        var cell = this.cells[icell];

        if(undefined == cell)
            return null;
        else
            return cell.get(ichord);

    },

    coordinate : function(){

        var p = this.parent();

        var i = p.lines.indexOf(this);

        return [i];

    },


    addCell : function(data,index){
        var parentName = "line";
        var ElementName = "cell";
        var removerMethodName = "removeCell";
        var arrayPropertyName = "cells";
        var cell = this.addChildHelper(data,index,parentName,ElementName,removerMethodName,arrayPropertyName);

        this.fire("cellAdded",[{
            "parent" : this,
            "child"  : cell
        }]);

        var grid = this.parent("grid");
        if(grid)
            grid.fire("cellAdded",[{
                "parent" : this,
                "child"  : cell
            }]);

        return cell;

    },

    removeCell : function(data){
        var arrayPropertyName = "cells";
        var elementName = "cell";
        var cell = this.removeChildHelper(data,elementName,arrayPropertyName);

        this.fire("cellRemoved",[{
            "parent" : this,
            "child"  : cell
        }]);

        var grid = this.parent("grid");
        if(grid)
            grid.fire("cellRemoved",[{
                "parent" : this,
                "child"  : cell
            }]);

        return cell;

    }

};


Jazzy.Entity.extends(Jazzy.Entity.Line,[

    {
        "name"      : "cells",
        "isEntity"  : true,
        "type"      : "cell",
        "isArray"   : true,
        "parentName": "line",
    },
    {
        "name"      : "section",
        "default"   : undefined
    }

] );
Jazzy.Entity.registerName("line",Jazzy.Entity.Line);Jazzy.Entity.Grid = function(){};

Jazzy.Entity.Grid.prototype = {

    get : function(iline,icell,ichord){

        if(undefined == iline)
            return this;

        var line = this.lines[iline];

        if(undefined == line)
            return null;
        else
            return line.get(icell,ichord);

    },

    addLine : function(data,index){
        var parentName = "grid";
        var ElementName = "line";
        var removerMethodName = "removeLine";
        var arrayPropertyName = "lines";

        var line = this.addChildHelper(data,index,parentName,ElementName,removerMethodName,arrayPropertyName);

        this.fire("lineAdded",[{
            "parent" : this,
            "child"  : line
        }]);

        return line;

    },

    removeLine : function(data){
        var arrayPropertyName = "lines";
        var elementName = "line";
        var line = this.removeChildHelper(data,elementName,arrayPropertyName);

        if(line){
            this.fire("lineRemoved",[{
                "parent" : this,
                "child"  : line
            }]);
        }
        return line;
    }

};

Jazzy.Entity.extends(Jazzy.Entity.Grid,[

    {
        "name"      : "lines",
        "isEntity"  : true,
        "type"      : "line",
        "isArray"   : true,
        "parentName": "grid",
    }

] );
Jazzy.Entity.registerName("grid",Jazzy.Entity.Grid);

        return Jazzy;

    }();
