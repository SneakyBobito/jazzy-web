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
