// ==UserScript==
// @name       	DS_Ankunftsfilter
// @namespace  	die-staemme.de
// @version    	0.2/07.01.2016
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       unsafeWindow
// @description Sortiert dörfer in kombinierter Übersicht nach Laufzeit bzgl. Zieldorf und blendet Dörfer mit zu wenigen Truppen aus.
// @include		https://*.die-staemme.de/game.php*screen=overview_villages*mode=combined*
// @include		https://*.die-staemme.de/game.php*screen=overview_villages*
// @include		https://*.die-staemme.de/game.php*screen=info_village*
// @include 	https://*.die-staemme.de/game.php*screen=place*targetAF*
// @copyright   2015+, M.Stapelfeld
// ==/UserScript==

/*
 *	v0.2: Truppen auswählbar in Einstellungen
 */

var troopspead = {"spear":18,"sword":22,"axe":18,"archer":18,"spy":9,"light":10,"marcher":10,"heavy":11,"ram":30,"catapult":30,"snob":35};

var config_standart = {"night_start":0,"night_end":8,"unitspead":1};

//var troops_standart = {"spear":0,"sword":0,"axe":0,"archer":0,"spy":0,"light":0,"marcher":0,"heavy":0,"ram":1,"catapult":0,"snob":0};

var $ = typeof unsafeWindow != 'undefined' ? unsafeWindow.$ : window.$;

$(function(){
	var storage = localStorage;
    var storagePrefix="AFilter_";
    //Speicherfunktionen
    function storageGet(key,defaultValue) {
        var value= storage.getItem(storagePrefix+key);
        return (value === undefined || value === null) ? defaultValue : value;
    }
    function storageSet(key,val) {
        storage.setItem(storagePrefix+key,val);
    }
	storageSet("config",storageGet("config",JSON.stringify(config_standart)));
	storageSet("troops",storageGet("troops",JSON.stringify({"spear":0,"sword":0,"axe":0,"archer":0,"spy":0,"light":0,"marcher":0,"heavy":0,"ram":1,"catapult":0,"snob":0})));
	//config aus localStorage

	var config 	= JSON.parse(storageGet("config"));
	var troops	= JSON.parse(storageGet("troops"));


	//alert(getPageAttribute("targetAF"))
	if(getPageAttribute("screen")=="overview_villages"){
		initUI();
	}else{
		if(getPageAttribute("screen")=="place" && getPageAttribute("targetAF")!="0"){
                $(".target-input-field").val(getPageAttribute("targetAF"));
		}
	}

	function initUI(){

        var head=$("#overview_menu");
        var settingsDivVisible = false;
        var overlay=$("<div>")
        .css({
            "position":"fixed",
            "z-index":"99999",
            "top":"0",
            "left":"0",
            "right":"0",
            "bottom":"0",
            "background-color":"rgba(255,255,255,0.6)",
            "display":"none"
        })
        .appendTo($("body"));
        var settingsDiv=$("<div>")
        .css({
            "position":"fixed",
            "z-index":"100000",
            "left":"50px",
            "top":"50px",
            "width":"600px",
            "height":"200px",
            "background-color":"white",
            "border":"1px solid black",
            "border-radius":"5px",
            "display":"none",
            "padding":"10px"
        })
        .appendTo($("body"));

        var settingsTable	= $("<table>").appendTo(settingsDiv);
		var unitTable		= $("<table>").appendTo(settingsDiv);

		var unitTableHead	= $("<tr>").attr("id","AF_unitTableHead").appendTo(unitTable);
		var unitTableInput	= $("<tr>").attr("id","AF_unitTableInput").appendTo(unitTable);
		for(var name in troopspead){
			$("<th>")
			.append(
				$("<span>")
				.append(
					$("<img>").attr("src","https://dsde.innogamescdn.com/8.40.2/27945/graphic/unit/unit_"+name+".png")
				)
			)
			.attr("id","AF_unitTableHead_"+name)
			.appendTo(unitTableHead);

			$("<td>")
			.append(
				$("<span>")
				.append(
					$("<input>")
					.attr("type","text")
					.attr("size","5")
					.attr("id",name)
					.val(troops[name])
					.on("input",function(){
						var thisname = $(this).attr("id");
						troops[thisname]	= $(this).val()>0 ? $(this).val() : 0;
						storageSet("troops",JSON.stringify(troops));
						console.log(storageGet("troops"));
					})
				)
			)
			.attr("id","AF_unitTableInput_"+name)
			.appendTo(unitTableInput);


		}




		var input_night_start	= $("<input>")
			.attr("type","text")
			.attr("size","3")
			.val(config.night_start)
			.on("input",function(){
				config.night_start	= $(this).val();
				storageSet("config",JSON.stringify(config));
			});
		var input_night_end		= $("<input>")
			.attr("type","text")
			.attr("size","3")
			.val(config.night_end)
			.on("input",function(){
				config.night_end	= $(this).val();
				storageSet("config",JSON.stringify(config));
			});
		var input_unitspead		= $("<input>")
			.attr("type","text")
			.attr("size","4")
			.val(config.unitspead)
			.on("input",function(){
				config.unitspead	= $(this).val();
				storageSet("config",JSON.stringify(config));
			});
		addRow(
			$("<span>").text("Nachtbonus von "),
			$("<div>").append(input_night_start).append($("<span>").text(" bis ")).append(input_night_end));
		addRow(
			$("<span>").text("effektive Einheitengeschw. "),
			$("<div>").append(input_unitspead).append($("<span>").text(" (1 => Ram 30 min/Feld)")));

		/*addRow(
			$("<span>").text("Zeit:"),
			$("<span>").text(""+)
				)*/

		$("<input>").attr("type","text")
		.val(storageGet("target","0|0"))
		.attr("size","8")
		.on("input",function(){
			storageSet("target",$(this).val());
			console.log("target: "+storageGet("target"));
		}).appendTo(settingsDiv);
		$("<button>").text("Speichern").click(function(){
			storageSet("config",JSON.stringify(config));
		}).appendTo(settingsDiv);
        $("<button>").text("Schließen").click(function(){
            toggleSettingsVisibility();
        }).appendTo(settingsDiv);

		$("<button>").text("Einstellungen").click(function(){
            toggleSettingsVisibility();
        }).appendTo(head);
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $("<button>").text("Sortieren").click(function(){

			sortTableToKoords(storageGet("target"));
			var position = troopPosition();
			var table 	= $("#combined_table");
			//erstellt ein Array aus Zeilen, lässt dabei die erste Zeile weg (Tabellenkopf..)
			var rows 	= $("tr",table).slice(1);

			var row;
			for(var i = 0; i<rows.length; i++){
				row	= rows[i];
				addLink(row,troops,storageGet("target"));
			}




        }).appendTo(head);



        function toggleSettingsVisibility() {
            if(settingsDivVisible) {
                overlay.hide();
                settingsDiv.hide();
            } else {
                overlay.show();
                settingsDiv.show();
            }

            settingsDivVisible=!settingsDivVisible;
        }
        function addRow(desc,content) {
            $("<tr>")
            .append($("<td>").append(desc))
            .append($("<td>").append(content))
            .appendTo(settingsTable);
        }


		var asc = false;

    }

	function troopPosition(){
		//zuerst rausfinden, in welcher spalte, welche Einheiten sind
		var table = $("#combined_table");
		var position = {};
		var img_src = "";
		alert("hier2");
		$("th",table).each(function(index){
			img_src = $("img",$(this)).attr("src");
			img_src = (img_src === undefined ||  img_src === null) ? "" : img_src;
			for(var name in troopspead){
				if(img_src.indexOf(""+name)>-1){
					position[name] = index;
				}
			}
		});

		return position;

	}
	function addLink(row,troops,target_koords){
		var quickeditvn 	= $(".quickedit-vn",row);
		var cell 			= quickeditvn.parents("td").eq(0);

		var ctime			= currentTime();
		//in min, grob minutengenau
		var duration		= Math.floor(distanceTo(target_koords,getKoordsfromRow(row))*slowestUnitSpead(troops));
		//theoretische Ankunftszeit durch aufadieren der Minuten
		ctime.setMinutes(ctime.getMinutes()+duration);
		ctime.setMonth(ctime.getMonth()-1);

		var troopstring		= "";
		for(var name in troops){
			troopstring		+= "&"+name+"="+troops[name];
		}
		var link_href		= "/game.php?village="+ quickeditvn.attr("data-id") +"&screen=place"+"&targetAF="+target_koords+troopstring;

		var link 			= $("<a>")
			.attr("href",link_href)
			.text(ctime.toString().substring(4,ctime.toString().indexOf("GMT")))
			.on("click",function(){
				$(".to_place",cell).css("background-color","red");
			});

		cell.append($("<span>").css("background-color","lime").append(link).attr("class","to_place")).append(quickeditvn);


		function slowestUnitSpead(troops){
			var speed	= 0;
			for(var name in troops){
				speed	= troops[name] > 0 && speed <= troopspead[name] ? troopspead[name] : speed;
			}

			return speed;
		}

	}
	function moveRow(row){
		row.after(row.previousSibling());
	}
	function sortTableToKoords(target_koords){
		var table 	= $("#combined_table");
		var rows = table.find('tr:gt(0)').toArray().sort(function(a,b){
			var valA	= distanceTo(target_koords,getKoordsfromRow(a));
			var valB	= distanceTo(target_koords,getKoordsfromRow(b));
			return valA - valB;
		});
		for (var i = 0; i < rows.length; i++){
			table.append(rows[i]);
		}
	}
	function distanceTo(koords1,koords2){
		//returns distance in fields
		var pos_trenn1 	= koords1.indexOf("|");
		var pos_trenn2	= koords2.indexOf("|");
		return Math.sqrt(Math.pow(parseInt(koords1.substring(0,pos_trenn1)) - parseInt(koords2.substring(0,pos_trenn2)),2) + Math.pow(parseInt(koords1.substring(pos_trenn1+1,koords1.length)) - parseInt(koords2.substring(pos_trenn2+1,koords2.length)),2));
	}
	function getKoordsfromRow(row){
		/*
		row: jquery obj tr
		return: koords
		*/
		var text 		= $(".quickedit-label",row).text();
		var data_text 	= $(".quickedit-label",row).attr("data-text");
        text			= text.substring(text.indexOf("(", text.indexOf(data_text)+data_text.length)+1,text.indexOf(")",text.indexOf(data_text)+data_text.length));
		return text;
	}
    function currentTime(){
		var date 	= $("#serverDate").text().split("/");
		var time 	= $("#serverTime").text().split(":");
		var d		= new Date(
						parseInt(date[2]),
						parseInt(date[1]),
						parseInt(date[0]),
						parseInt(time[0]),
						parseInt(time[1]),
						parseInt(time[2]),
						0);
		return d;
	}



	////////////////////////////////////////////////////////////
	$('th').click(function(){
		var table = $(this).parents('table').eq(0)
		var rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()))
		this.asc = !this.asc
		if (!this.asc){rows = rows.reverse()}
		for (var i = 0; i < rows.length; i++){table.append(rows[i])}
	})
	function comparer(index) {
		return function(a, b) {
			var valA = getCellValue(a, index), valB = getCellValue(b, index)
			return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
		}
	}
	function getCellValue(row, index){ return $(row).children('td').eq(index).html() }
	function getPageAttribute(attribute){
        //gibt den Screen zurück, also z.B. von* /game.php?*&screen=report*
        //wenn auf confirm-Seite, dann gibt er "confirm" anstatt "place" zurück
        //return: String
        var params = document.location.search;
        var value = params.substring(params.indexOf(attribute+"=")+attribute.length+1,params.indexOf("&",params.indexOf(attribute+"=")) != -1 ? params.indexOf("&",params.indexOf(attribute+"=")) : params.length);
        return params.indexOf(attribute+"=")!=-1 ? value : "0";
    }
});
