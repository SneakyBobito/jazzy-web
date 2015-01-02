
Jazzy.Entity.Chord.prototype.coordinateStr =
Jazzy.Entity.Line.prototype.coordinateStr =
Jazzy.Entity.Cell.prototype.coordinateStr =
    function(){
        return this.coordinate().join("-");
    };


Jazzy.Entity.Chord.prototype.chordTemplate = function(){
    return this.pattern == "repeat" ? "%" : this.chord.name;
};

var formDialog = function(form,data,additional){

    var output = ich[form](data);

    $("#dialog-wrapper .dialog-window").html(output);
    $("#dialog-wrapper").addClass("active");


    this.successHandler = additional.success;

    this.bind();


    if(additional.afterShow){
        additional.afterShow.call(this,$("#dialog-wrapper .dialog-window"));
    }

};

formDialog.prototype = {

    bind : function(){

        var self = this;

        $("#dialog-wrapper .dialog-window form").submit(function(e){
            e.preventDefault();
            self.submited($(this));
            return false;
        });

    },

    submited : function($form){

        var data = {};
        jQuery.each( $form.serializeArray() , function( i, field ) {
          data[field.name] = field.value;
        });

        if(this.successHandler){
            this.successHandler.call(this,data,$form);
        }

    },

    close : function(){
        $("#dialog-wrapper").removeClass("active");
    }

};

var JzApp = function(){};

JzApp.prototype.start = function(grid,wrapper){

    this.grid = grid;
    this.$wrapper = $(wrapper);

    this.redraw(grid);

    grid.bind("chordUpdated",function(c){
        var coord = c.coordinate();
        var output = ich.chord(c);
        $( ".jz-chord-li[coordinate='" + c.coordinateStr() + "']" , this.wrapper).html(output);
        //this.bind(output);
    });

    this.JzContext = new JzContext(this,"contextMenu");
    this.JzHistory = new JzHistory();

};

JzApp.prototype.redraw = function(entity){

    if(!entity)
        entity = this.grid;

    if(entity instanceof Jazzy.Entity.Grid){
        var output = ich.grid(entity);
        this.$wrapper.html(output);
        this.bind(this.$wrapper);
    }

};

JzApp.prototype.bind = function(section){

    if(undefined === section)
        section = this.$wrapper;

    var self = this;

    $(".jz-chord-li",section).click(function(e){
        var chord = self.getChordFromElement($(this));

        var $cell = $(this).closest(".jz-cell-li");

        var cellOffset = $cell.offset();

        var windowCoordinates = {x : cellOffset.left, y : cellOffset.top + $cell.height() + 10};
        // todo : verify coordinates

        self.JzContext.show(windowCoordinates,{
            grid : chord.parent("grid"),
            line : chord.parent("line"),
            cell : chord.parent("cell"),
            chord: chord
        });

    });


};

JzApp.prototype.getChordFromElement = function($el){

    var c = $el.attr("coordinate").split('-');

    return this.grid.get(c[0],c[1],c[2]);

};

JzApp.prototype.getElementFromEntity = function(entity){

    return $("[coordinate=" + entity.coordinateStr() + "]",this.$wrapper);

};
