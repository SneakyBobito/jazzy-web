var JzContext = function(JzApp,menuName){

	this.JzApp    = JzApp;
	this.menuName = menuName;

	this.$actualMenu = null;
}


JzContext.prototype = {

	/** Show the menu according to the given contect (mouse coordinate,grid,line,cell,chord)**/
	show : function(coord , inputData){

		// Close old menu
		if(this.$actualMenu){
			this.close();
		}

		var $menu = $(ich[this.menuName](inputData));
		var grid = inputData.grid;
		var line = inputData.line;
		var cell = inputData.cell;
		var chord = inputData.chord;

		// Set new menu in this
		this.$actualMenu = $menu;

		// Populate the menu
		this.__prepareMenu($menu,coord,grid,line,cell,chord);

		// show the currently edited chord/cell/line/grid
		if(inputData.chord){
			this.JzApp.getElementFromEntity(inputData.chord).addClass("context-menu-open");
		}
		if(inputData.cell){
			this.JzApp.getElementFromEntity(inputData.cell).addClass("context-menu-open");
		}
		if(inputData.line){
			this.JzApp.getElementFromEntity(inputData.line).addClass("context-menu-open");
		}



		// add menu to screen
		$("body").append($menu);

		// Bind actions to menu
		this.bindMenu($menu);

		// autoselect chord name input
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
			left: coord.x,
			top : coord.y
		});

		// link the data to the element
		$menu.data("jzMenu",{
			chord : chord,
			cell  : cell,
			line  : line,
			grid  : grid
		});
	},

	close : function(){

		var data = this.$actualMenu.data("jzMenu");

		$(".context-menu-open",this.JzApp.$wrapper).removeClass("context-menu-open");

		this.$actualMenu.remove();
	},

	bindMenu : function($menu){

		var self = this;

		////////////////
		// CHORD EDITOR
		//
		$(".chord-editor form",$menu).submit(function(e){
	        e.preventDefault();

	        var $form = $(this);
	        var chord = $menu.data("jzMenu").chord;

	        var data = {};
	        jQuery.each( $form.serializeArray() , function( i, field ) {
	          data[field.name] = field.value;
	        });

	        if(data.chord !== chord.chord.name){

				var oldChord = chord.chord;
	            var res = chord.update(data.chord);

	            if(!res){
	                alert("Chord not valid");
	            }else{
					// history
					var newChord = chord.chord;
					self.JzApp.JzHistory.add(
						function(){
							chord.chord = oldChord;
							self.JzApp.redraw();
						},
						function(){
							chord.chord = newChord;
							self.JzApp.redraw();
						}
					);

	                self.close();
	            }
	        }else{
	            self.close();
	        }

	        return false;
	    });



		//////////////////////
		// CELL PATTERN EDITOR
		//
		$(".pattern-list [data-pattern]",$menu).click(function(){
			var pattern = $(this).attr("data-pattern");
			var data    = self.$actualMenu.data("jzMenu");
			if(data.cell){
				var currentPattern = data.cell.pattern;

				// proceed only if different
				if(currentPattern !== pattern){


					var handler = function(){
						data.cell.pattern = pattern;
						self.JzApp.redraw(data.grid);
					};

					// history
					self.JzApp.JzHistory.add(
						function(){
							data.cell.pattern = currentPattern;
							self.JzApp.redraw(data.grid);
						},
						handler
					);

					// execute
					handler();
				}
			}
			self.close();
		});



		//////////////
		// CELL DELETE
		//
		$(".cell-delete",$menu).click(function(){

			var data    = self.$actualMenu.data("jzMenu");

			if(data.cell && data.line){

				var oldIndex = data.line.cells.indexOf(data.cell);
				var cell  = data.cell;
				var line  = data.line;

				line.removeCell(cell);
				self.JzApp.redraw();

				// history
				self.JzApp.JzHistory.add(
					function(){
						line.addCell(cell,oldIndex);
						self.JzApp.redraw();
					},
					function(){
						line.removeCell(cell);
						self.JzApp.redraw();
					}
				);
			}

			self.close();

		});


		/////////////////
		// CELL DUPLICATE
		//
		$(".cell-duplicate",$menu).click(function(){

			var data    = self.$actualMenu.data("jzMenu");

			if(data.cell && data.line){

				var oldCell = data.cell;
				var cellExport = oldCell.export();
				var newCell = Jazzy.createEntity('cell',cellExport);

				var line  = data.line;
				var oldIndex = line.cells.indexOf(oldCell);

				var handler = function(){
					line.addCell(newCell,oldIndex);
					self.JzApp.redraw();
				};

				// execute
				handler();

				// history
				self.JzApp.JzHistory.add(
					function(){
						line.removeCell(newCell);
						self.JzApp.redraw();
					},
					handler
				);
			}

			self.close();

		});



		//////////////
		// LINE DELETE
		//
		$(".line-delete",$menu).click(function(){

			var data    = self.$actualMenu.data("jzMenu");

			if(data.grid && data.line){

				var grid  = data.grid;
				var line  = data.line;
				var oldIndex = data.grid.lines.indexOf(line);

				var handler = function(){
					grid.removeLine(line);
					self.JzApp.redraw();
				}

				// execute
				handler();

				// history
				self.JzApp.JzHistory.add(
					function(){
						grid.addLine(line,oldIndex);
						self.JzApp.redraw();
					},
					handler
				);
			}

			self.close();

		});



		/////////////////
		// LINE DUPLICATE
		//
		$(".line-duplicate",$menu).click(function(){

			var data = self.$actualMenu.data("jzMenu");

			if(data.grid && data.line){

				var oldLine    = data.line;
				var LineExport = oldLine.export();
				LineExport.section = null;
				var newLine    = Jazzy.createEntity('line',LineExport);

				var grid  = data.grid;
				var oldIndex = grid.lines.indexOf(oldLine);

				var handler = function(){
					grid.addLine(newLine,oldIndex+1);
					self.JzApp.redraw();
				};

				// execute
				handler();

				// history
				self.JzApp.JzHistory.add(
					function(){
						grid.removeLine(newLine);
						self.JzApp.redraw();
					},
					handler
				);
			}

			self.close();

		});



		////////////////////
		// LINE SECTION NAME
		//
		$(".line-section-name form",$menu).submit(function(e){

			e.preventDefault();

			var data = self.$actualMenu.data("jzMenu");

			if(data.line){

				// parse form data
				var formSerialize = $(this).serializeArray();
				var inputData = {};
				jQuery.each( $(this).serializeArray() , function( i, field ) {
					inputData[field.name] = field.value;
				});

				// init
				var line       = data.line;
				var oldSection = line.section;
				var newSection = inputData.sectionName;

				// set section
				if( newSection !== oldSection ){

					var handler = function(){
						line.section = inputData.sectionName
						self.JzApp.redraw();
					};

					// execute
					handler();

					// history
					self.JzApp.JzHistory.add(
						function(){
							line.section = oldSection;
							self.JzApp.redraw();
						},
						handler
					);

				}
			}

			self.close();

			return false;

		});

	}

};
