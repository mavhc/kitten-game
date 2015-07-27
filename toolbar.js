dojo.declare("classes.ui.Toolbar", null, {
	
	icons: null,
	game: null,
	
	constructor: function(game){
		this.game = game;
		
		this.icons= [];


		this.addIcon(new classes.ui.toolbar.ToolbarHappiness(game));
		this.addIcon(new classes.ui.toolbar.ToolbarEnergy(game));
	},	
	
	addIcon: function(icon){
		this.icons.push(icon);
	},
	
	render: function(container){
		dojo.empty(container);
		
		for (i in this.icons){
			var iconContainer = this.icons[i].render(container);
			this.attachToolbarTooltip(iconContainer, this.icons[i]);
		}
	},
	
	update: function(){
		for (i in this.icons){
			this.icons[i].update();
		}
	},
	
	
	//TODO: move all this stuff to some util class?
	attachToolbarTooltip: function(container, icon){
		var tooltip = dojo.byId("tooltip");
		dojo.empty(tooltip);
		
		dojo.connect(container, "onmouseover", this, dojo.partial(function(tooltip, event){
			 this.game.tooltipUpdateFunc = function(){
				tooltip.innerHTML = icon.getTooltip();
			 };
			 this.game.tooltipUpdateFunc();

			 var target = event.originalTarget || event.toElement;
			 var pos = $(target).offset();
			 if (!pos){
				 return;
			 }

			 dojo.setStyle(tooltip, "left", pos.left + "px");
			 dojo.setStyle(tooltip, "top",  pos.top + "px");
			
			 dojo.setStyle(tooltip, "display", ""); 
			 dojo.setStyle(container, "fontWeight", "bold"); 
			 
	    }, tooltip));
	    
		dojo.connect(container, "onmouseout", this, dojo.partial(function(tooltip, container){
			 this.game.tooltipUpdateFunc = null;
			 dojo.setStyle(tooltip, "display", "none"); 
			 dojo.setStyle(container, "fontWeight", "normal");
		},tooltip, container));
		
	},
	
	updateTooltip: function(container, tooltip, htmlProvider){
		tooltip.innerHTML = dojo.hitch(this, htmlProvider)();
	}
});

dojo.declare("classes.ui.ToolbarIcon", null, {
	game: null,
	container: null,
	
	constructor: function(game){
		this.game = game;
	},	
	
	render: function(container){
		this.container = dojo.create("span", { 
			className: "toolbarIcon"
		}, container);
		
		return this.container;
	},
	
	update: function(){
	},
	
	getTooltip: function(){
		return "Unimplemented";
	}
});

dojo.declare("classes.ui.toolbar.ToolbarHappiness", classes.ui.ToolbarIcon, {
	update: function(){

		if (this.game.village.getKittens() <= 5){
			dojo.style(this.container, "display", "none");
		} else {
			dojo.style(this.container, "display", "");
		}

		this.container.innerHTML = "&#128568;&nbsp;" + Math.floor(this.game.village.happiness * 100) + "%";
		$(this.container).css("color", "Coral");
	},

	getTooltip: function(){
		var base = this.game.bld.getEffect("happiness");
		//var population = this.game.village.getKittens() *  2;
		var tooltip = "Base: 100%<br>" +
			   "Buildings: +" + (Math.floor(base)) + "%<br>";

        var unhappiness = ( this.game.village.getKittens()-5 ) * 2;
        var unhappiness = unhappiness + unhappiness * this.game.bld.getEffect("unhappinessRatio", true);

        tooltip += "Population: -" + this.game.getDisplayValueExt(unhappiness, false, false, 0) + "%<br>";

        var overpopulation = this.game.village.getKittens() - this.game.village.maxKittens;
        if (overpopulation > 0){
            tooltip += "Overpopulation: -" + overpopulation*2 + "%<br>";
        }

        return tooltip;
    }
});

dojo.declare("classes.ui.toolbar.ToolbarEnergy", classes.ui.ToolbarIcon, {
	update: function(){

		if (!this.game.science.get("electricity").researched){
			dojo.style(this.container, "display", "none");
		} else {
			dojo.style(this.container, "display", "");
		}

		var resPool = this.game.resPool;
		var energy = resPool.energyProd - resPool.energyCons; 
		this.container.innerHTML = "&#9889;&nbsp;" + this.game.getDisplayValueExt(energy) + "Wt";
		
		if (energy >= 0){
			$(this.container).css("color", "green");
		} else {
			$(this.container).css("color", "red");
		}
	},
	getTooltip: function(){
		var resPool = this.game.resPool;
		var energy = resPool.energyProd - resPool.energyCons; 

        var delta = this.game.resPool.getEnergyDelta();
		var penalty = energy >= 0 ? "" :"<br><br>Production modifier: <span style='color:red;'>-" + Math.floor( (1-delta) * 100) + "%</span>";
		
		return "Production: <span style='color:green;'>" +  this.game.getDisplayValueExt(resPool.energyProd, true, false) + "Wt</span>" +
			   "<br>Consumption: <span style='color:#D00000;'>-" +  this.game.getDisplayValueExt(resPool.energyCons) + "Wt</span>" + penalty;
	}
});
