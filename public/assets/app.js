var JzApp = {};

JzApp.start = function(){
    App.bind(document);
};

JzApp.bind = function(section){

    if(undefined == section)
        section = document;

    $(".jz-chord-li",document).click(function(){
        App.editChord($this);
    });

};


JzApp.editChord = function($chord){

};