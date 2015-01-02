var JzHistory = function(options){

        var options = options || {};

        this.maxStack = options.maxStack || 30;
        this.stack = [];
        this.redoStack = [];

};


JzHistory.prototype = {

    add : function(undo,redo){

        this.stack.push({
            "undo"  : undo,
            "redo" : redo,
        });

        this.redoStack = [];

        if(this.stack.length > this.maxStack){
            // todo : remove begining
        }

    },

    undo : function(){
        if(this.stack.length>0){
            var last = this.stack.pop();
            var undo = last.undo;
            this.exec(undo);
            this.redoStack.push(last);
        }
    },

    redo : function(){
        if(this.redoStack.length>0){
            var last = this.redoStack.pop();
            var redo = last.redo;
            this.exec(redo);

            this.stack.push(last);
        }
    },

    exec : function(item){

        if(item.hasOwnProperty("obj"))
            item.obj[item.methd].apply(item.obj,item.params);
        else
            item.apply(null,[]);
    }

}
