var JzContext = function(JzApp,menuName){

	this.JzApp    = JzApp;
	this.menuName = menuName;

	this.$actualMenu = null;
}


JzContext.prototype = {

	/** Show the menu according to the given contect (mouse coordinate,grid,line,cell,chord)**/
	show : function(coord , inputData){

		if(this.$actualMenu){
			this.close();
		}

		var $menu = $(ich[this.menuName](inputData));
		var grid = inputData.grid;
		var line = inputData.line;
		var cell = inputData.cell;
		var chord = inputData.chord;

		this.$actualMenu = $menu;

		this.__prepareMenu($menu,coord,grid,line,cell,chord);

		$("body").append($menu);

		this.bindMenu($menu);

		if(chord){
			$menu.find(".chord-name").focus().select();
		}

	},

	__prepareMenu : function($menu,coord,grid,line,cell,chord){

		// hide all section and show only what we need
		$menu.find(".main-section").hide();

		// look for each section to show
		if(chord){
			$menu.find(".chord-section").show();
		}
		if(cell){
			$menu.find(".cell-section").show();
		}
		if(line){
			$menu.find(".line-section").show();
		}
		if(grid){
			$menu.find(".grid-section").show();
		}

		// place the menu next to the mouse
		$menu.css({
			left: coord.x - 7,
			top : coord.y + 8
		});

		// link the data to the element
		$menu.data.chord = chord;
	},

	close : function(){
		this.$actualMenu.remove();
	},

	bindMenu : function($menu){

		var self = this;

		$(".chord-editor form",$menu).submit(function(e){
            e.preventDefault();

            var $form = $(this);
            var chord = $menu.data.chord;

            var data = {};
	        jQuery.each( $form.serializeArray() , function( i, field ) {
	          data[field.name] = field.value;
	        });

            if(data.chord !== chord.chord.name){
                var res = chord.update(data.chord);

                if(!res){
                    alert("Chord not valid");
                }else{
                    self.close();
                }
            }else{
                self.close();
            }

            return false;
        });

	}

};
