$(function(){

    var gridJson = {
        "lines" : [
            {
                "section" : "intro",
                "cells" : [
                    {
                        "pattern":"1-1-1-1",
                        "chords" : [
                            {"chord" : "A"},
                            {"chord" : "B"},
                            {"chord" : "A"},
                            {"chord" : "C"}
                        ]
                    },
                    {
                        "pattern": "3-1",
                        "chords" : [
                            {"chord" : "A"},
                            {"chord" : "A7"}
                        ]
                    },
                    {
                        "pattern": "2-1-1",
                        "chords" : [
                            {"chord" : "Bm"},
                            {"chord" : "A"},
                            {"chord" : "Bm"}
                        ]
                    },
                    {
                        "chords" : [
                            {"chord" : "E7"}
                        ]
                    }
                ]
            },
            {
                "section": "part1",
                "cells" : [
                    {
                        "pattern": "1-3",
                        "chords" : [
                            {"chord" : "Am"},
                            {"chord" : "Bm"}
                        ]
                    },
                    {
                        "pattern": "1-1-2",
                        "chords" : [
                            {"chord" : "Am"},
                            {"chord" : "Bm"},
                            {"chord" : "Am"}
                        ]
                    },
                    {
                        "chords" : [
                            {"chord" : "Cm"}
                        ]
                    },
                    {
                        "chords" : [
                            {"chord" : "Cm"}
                        ]
                    },
                    {
                        "pattern":"repeat",
                        "chords" : []
                    },
                    {
                        "pattern": "2-2",
                        "chords" : [
                            {"chord" : "F#7"},
                            {"chord" : "B7"}
                        ]
                    }
                ]
            },
            {
                "cells" : [
                    {
                        "pattern":"1-1-1-1",
                        "chords" : [
                            {"chord" : "A"},
                            {"chord" : "B"},
                            {"chord" : "A"},
                            {"chord" : "C"}
                        ]
                    },
                    {
                        "pattern": "3-1",
                        "chords" : [
                            {"chord" : "A"},
                            {"chord" : "A7"}
                        ]
                    },
                    {
                        "pattern": "2-1-1",
                        "chords" : [
                            {"chord" : "Bm"},
                            {"chord" : "A"},
                            {"chord" : "Bm"}
                        ]
                    },
                    {
                        "chords" : [
                            {"chord" : "E7"}
                        ]
                    }
                ]
            },
            {
                "cells" : [
                    {
                        "pattern":"1-1-1-1",
                        "chords" : [
                            {"chord" : "A"},
                            {"chord" : "B"},
                            {"chord" : "A"},
                            {"chord" : "C"}
                        ]
                    },
                    {
                        "pattern": "3-1",
                        "chords" : [
                            {"chord" : "A"},
                            {"chord" : "A7"}
                        ]
                    },
                    {
                        "pattern": "2-1-1",
                        "chords" : [
                            {"chord" : "Bm"},
                            {"chord" : "A"},
                            {"chord" : "Bm"}
                        ]
                    },
                    {
                        "chords" : [
                            {"chord" : "E7"}
                        ]
                    }
                ]
            }
        ]
    };

    var grid = Jazzy.createEntity("grid",gridJson);

    var app = new JzApp();

    app.start(grid,"#grid-wrapper");

    $(".dialog-background").click(function(){
        $(this).parent().removeClass("active");
    });

    $("#undo").click(function(){
        app.JzHistory.undo();

    });

    $("#redo").click(function(){
        app.JzHistory.redo();
    });


});
