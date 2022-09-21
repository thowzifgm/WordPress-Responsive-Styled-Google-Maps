/**
 * Plugin's admin jquery functions and included jQuery libraries
 */

/**
 * Initialize the required fields and settings
 */
jQuery(document).ready(function() {
	// if we are on the responsive map admin page
    if (jQuery('#mapcolor').length) {

    	if ( jQuery("#resmap_apikey").val() == '' || shortcode === "") {
    		resmap_updateMap(pluginurl);
    	} else {
    		// load the shortcode previously saved
    			resmap_loadShortcode(shortcode);
    	}
        
        // initialize the color picker
        jQuery('#mapcolor').colorPicker( { onColorChange : function(id, newValue) { 
            jQuery('#newcolor').val(newValue);
                resmap_updateMap(pluginurl);
            } } );
        resmap_showHideColorPicker();

        // initalise the LOAD SHORTCODE dialog
        jQuery('#resmap-dialog').dialog({
            title: 'Load a previously created shortcode',
            dialogClass: 'wp-dialog',
            autoOpen: false,
            draggable: true,
            width: 'auto',
            modal: true,
            resizable: false,
            closeOnEscape: true,
            position: {
              my: "center",
              at: "center",
              of: window
            },
            buttons: {
                        "Submit": function() {
                            resmap_loadShortcode( jQuery("#loaded-shortcode").val());
                            jQuery(this).dialog("close");
                        },
                        "Cancel": function() {
                            jQuery( this ).dialog( "close" );
                        }
                    },
            open: function () {
            	// Close dialog by clicking the overlay behind it
              	jQuery(".ui-widget-overlay").bind('click', function(){
                	jQuery("#resmap-dialog").dialog('close');
              	})
            },
            create: function () {
            	// Style fix for WordPress admin
              	jQuery(".ui-dialog-titlebar-close").addClass("ui-button");
            },
        });

        // bind the button to open the LOAD SHORTCODE dialog
        jQuery("a.load-shortcode").click(function(e) {
            e.preventDefault();
            jQuery("#resmap-dialog").dialog("open");
        });
    }
 });

/**
 * Reset all the fields of the form to their default settings
 * @param withMapReload true or false, telling if a map reload should be done
 */
function resmap_resetSettings(withMapReload) {
	jQuery("#address").val("Yeronga QLD 4104, Australia");

    imgUrl = pluginurl + '/responsive-maps-plugin/includes/img/company.png';
    imgHtml = "<img src='" + imgUrl + "'> {br} Yeronga QLD 4104, Australia {br} Phone:  0040 752 235 756";
	jQuery("#rsdescription").val(imgHtml);

	jQuery("#directionstext").val("(directions to our address)");
	jQuery("input[name=icon][value=blue]").prop('checked', 'checked');
    jQuery("#iconurl").val(pluginurl + "/responsive-maps-plugin/includes/icons/pin.png");
    jQuery("#iconsize").val("");
    jQuery("#style").val("2");
    jQuery("#scalecontrol").val("no");
    jQuery("#typecontrol").val("no");
    jQuery("#streetcontrol").val("no");
    jQuery("#locateme").val("no");
    jQuery("#zoom").val("13");
    jQuery("#zoomcontrol").val("no");
    jQuery("#draggable").val("yes");
    jQuery("#scrollwheel").val("no");
    jQuery("#searchbox").val("no");
    jQuery("#clustering").val("no");
    jQuery("#logging").val("no");
    jQuery("#poi").val("yes");
    jQuery("#fullscreen").val("no");
    jQuery("#width").val("100");
    jQuery("#widthm").val("%");
    jQuery("#height").val("500");
    jQuery("#heightm").val("px");
    jQuery("#maptype").val("roadmap");
    jQuery("#popup").val("no");
    jQuery("#refresh").val("yes");
    jQuery("#center").val("");

    // if the parameter withMapReload is true, also refresh the map preview
    if (withMapReload) {
    	resmap_updateMap(pluginurl);
    }
}

/**
 * Decode HTML entities from a given string 
 * @param str is the string to decode HTML entities from
 */
function resmap_decodeHtmlEntities(str) {
    return jQuery("<textarea/>").html(str).text();
}; 

/**
 * Load the shortcode into settings form 
 * @param shortcode is the map shortcode to load in format [res_map ....]
 */
function resmap_loadShortcode(shortcode) {
    // if shortcode is empty, just return
    if (shortcode.trim() == '') {
        return;
    }

    // decode html entities
    shortcode = resmap_decodeHtmlEntities(shortcode);

	// extract from the shortcode only the part without [res_map... ] 
    shortcode = shortcode.substr(8);

    // regex patterns
    var NUMERIC_REGEXP = /[\d.]*[\d]+/g;
    var UNIT_REGEX = /(px)*(%)*?$/g;
    var HEX_COLOR_REGEX = /^#[0-9a-f]{3,6}$/g;
    var HTTP_REGEX = /^(http|https):/g;

    // parse the shortcode and extract pairs of settings in the format key->value 
    var q = {};
    shortcode.replace(/\s?\[?([^=]+)="([^"]*)"\]?/g, function(m, key, value){
        q[key] = (q[key] ? q[key] + "," : "") + value;
    });

	// reset settings to their default values before loading the shortcode
	resmap_resetSettings(false);

	// process each key->value pair from shortcode and set them in the settings form
    for ( var key in q ) {

    	if (key == "description") {

    		jQuery("#rsdescription").val(q[key]);

        } else if (key == "directionstext") {

    		jQuery("#directionstext").val(q[key]);

        } else if (key == "width") {

            var nr = q[key].match(NUMERIC_REGEXP)[0];
            var unit = q[key].match(UNIT_REGEX)[0];

            jQuery("#width").val(nr);
            jQuery("#widthm").val(unit);

        } else if (key == "height"){
            
            var nr = q[key].match(NUMERIC_REGEXP)[0];
            var unit = q[key].match(UNIT_REGEX)[0];

            jQuery("#height").val(nr);
            jQuery("#heightm").val(unit);

        } else if (key == "style"){

        	var matches = q[key].match(HEX_COLOR_REGEX);

        	if (matches != null) {
        		// this is the case when the style is given with hex color
        		jQuery("#style").val(0);
        		jQuery("#mapcolor").val(matches[0]);
        		jQuery("#newcolor").val(matches[0]);
        		jQuery("#mapcolor").trigger("change");
        		
        	} else {
        		// this is the case when the style is given with a number between 1-50
        		jQuery("#style").val(q[key]);
        	}

        	resmap_showHideColorPicker();

        } else if (key == "icon") {

    		var matches = q[key].match(HTTP_REGEX);

    		if (matches != null) {
    			// this is the case when the icon is given with a http link
    			jQuery("input[name=icon][value='custom']").prop("checked",true);
    			jQuery("#iconurl").val(q[key]);
    		} else {
    			// this is the case when the icon is given with a color or more colors
    			colors = q[key].split("|");
    			color = colors[0];

    			jQuery("input[name=icon][value=" + color + "]").prop('checked', 'checked');
                jQuery("#iconurl").val(pluginurl + "/responsive-maps-plugin/includes/icons/pin.png");
    		}

    		jQuery("input[name=icon]").trigger("change");

        } else if (q[key] != null && q[key].trim() != '') {
            id = "#" + key.trim();
            jQuery(id).val(q[key]);
            //console.log(key + "=" +jQuery(id).val() + "    //" + q[key]);
        }
    }

    // after all the settings are set, also update the map preview 
    resmap_updateMap(pluginurl);
}

/**
 * Show or hide the color picker 
 */
function resmap_showHideColorPicker() {
    if (jQuery("#style").val() == 0) {
        // the case when the style is given by a hex color
        jQuery(".colorPicker-picker").show();
        jQuery(".colorPicker-picker").css('position', 'absolute');
        jQuery(".colorPicker-picker").css('display', 'inline');
        jQuery("#colorinfo").hide();
    } else {
        // the case when the style is given by a number between 1-50 representing a custom map style
        jQuery(".colorPicker-picker").hide();
        jQuery("#colorinfo").show();
    }
}

/**
 * Get the pre-defined map style
 * @param id is a number between 1-30 inclusive, representing the id of the map style
 */
function resmap_getStyleString(id) {
    var mapstyle;
    color = '';

    // The custom color style (for instance style="#ff0023")
    if (id.indexOf('#') == 0) {
        mapcolor = id;
        id = '51';
    }

    switch (id) {
    case '1':
        mapstyle = [{"stylers":[{"featureType":"all"}]}];
        break;
    case '2':
        mapstyle = [{"stylers":[{"featureType":"all"},{"saturation":-100},{"gamma":0.50},{"lightness":30}]}];
        break;
    case '3':
        mapstyle = [{"stylers":[{"invert_lightness":true},{"visibility":"on"}]}];
        break;
    case '4':
        mapstyle = [{"stylers":[{"invert_lightness":true},{"hue":"#0000b0"},{"saturation":-30}]}];
        break;
    case '5':
        mapstyle = [{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]},{"featureType":"landscape","stylers":[{"color":"#f2e5d4"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}];
        break;
    case '6':
        mapstyle = [{"stylers":[{"lightness":10},{"gamma":1.2},{"saturation":-20},{"visibility":"on"},{"weight":0.1},{"hue":"#00ccff"}]}];
        break;
    case '7':
        mapstyle = [{"stylers":[{"saturation":-20},{"visibility":"on"},{"hue":"#00ccff"},{"invert_lightness":true},{"lightness":5}]}];
        break;
    case '8':
        mapstyle = [{"stylers":[{"saturation":-20},{"visibility":"on"},{"lightness":5},{"hue":"#ff004c"},{"gamma":1.45}]}];
        break;
    case '9':
        mapstyle = [{"featureType":"water","stylers":[{"color":"#021019"}]},{"featureType":"landscape","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"transit","stylers":[{"color":"#146474"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]}];
        break;
    case '10':
        mapstyle = [{"stylers":[{"visibility":"on"},{"saturation":-30},{"hue":"#ccff00"},{"lightness":-20},{"gamma":1},{"weight":0.1},{"invert_lightness":true}]}];
        break;
    case '11':
        mapstyle = [{"stylers":[{"hue":"#00ccff"},{"saturation":5},{"lightness":-20}]}];
        break;
    case '12':
        mapstyle = [{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"hue":149},{"saturation":-78},{"lightness":0}]},{"featureType":"road.highway","stylers":[{"hue":-31},{"saturation":-40},{"lightness":2.8}]},{"featureType":"poi","elementType":"label","stylers":[{"visibility":"off"}]},{"featureType":"landscape","stylers":[{"hue":163},{"saturation":-26},{"lightness":-1.1}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"water","stylers":[{"hue":3},{"saturation":-24.24},{"lightness":-38.57}]}];
        break;
    case '13':
        mapstyle = [{"stylers":[{"gamma":1.58},{"saturation":30},{"weight":0.1}]}];
        break;
    case '14':
        mapstyle = [{"stylers":[{"invert_lightness":true},{"weight":0.1},{"hue":"#00ffa2"},{"visibility":"on"},{"saturation":-120},{"lightness":10},{"gamma":1.2}]}];
        break;
    case '15':
        mapstyle = [{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#00ccff"},{"weight":0.1},{"saturation":80}]},{"featureType":"road.local","elementType": "geometry","stylers":[{"visibility":"on"},{"lightness":30}]},{"featureType":"transit","stylers":[{"hue":"#0077ff"},{"lightness":100},{"color":"#141480"},{"visibility":"simplified"},{ "saturation":-30},{"gamma":0.96},{"invert_lightness":true}]},{"featureType":"administrative.neighborhood","stylers":[{"invert_lightness":true},{"visibility":"on"}]},{"featureType": "road.highway.controlled_access","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","stylers":[{"weight":0.1}]},{"featureType":"road.local","stylers":[{ "visibility":"off"}]},{"featureType":"administrative","stylers":[{"invert_lightness":true},{"hue":"#00ff66"},{"saturation":30},{"lightness":-20},{"gamma":1.91}]},{"stylers":[{ "weight":0.1}]}];
        break;
    case '16':
        mapstyle = [{"featureType":"road","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"visibility":"off"}]},{"featureType":"administrative","stylers":[{ "weight":0.9}]}];
        break;
    case '17':
        mapstyle = [{"stylers":[{"hue":"#ffd500"},{"lightness":-30}]}];
        break;
    case '18':
        mapstyle = [{"featureType":"road","stylers":[{"hue":"#e6ff00"}]},{"featureType":"road","stylers":[{"visibility":"on" },{"weight":0.1},{"lightness":10},{"gamma":0.96}]},{ "featureType":"administrative","elementType":"labels.icon","stylers":[{"visibility":"simplified"},{"weight":0.1}]},{"stylers":[{"hue":"#0019ff"},{"lightness":10},{"gamma":0.96}]},{ "stylers":[{"gamma":0.96},{"weight":0.1}]},{"featureType":"administrative","stylers":[{"color":"#328080"}]}];
        break;
    case '19':
        mapstyle = [{"featureType":"road","stylers":[{"lightness":-10},{"weight":0.1},{"hue":"#008000"}]},{"stylers":[{"saturation":30},{"lightness":-10}]}];
        break;
    case '20':
        mapstyle = [{"stylers":[{"visibility":"on"},{"weight":0.9},{"hue":"#005eff"},{"lightness":-10},{"gamma":1.2}]}];
        break;
    case '21':
        mapstyle = [{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#aee2e0"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#abce83"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#769E72"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#7B8758"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"color":"#EBF4A4"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"visibility":"simplified"},{"color":"#8dab68"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#5B5B3F"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ABCE83"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#A4C67D"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#9BBF72"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#EBF4A4"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#87ae79"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#7f2200"},{"visibility":"off"}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"visibility":"on"},{"weight":4.1}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#495421"}]},{"featureType":"administrative.neighborhood","elementType":"labels","stylers":[{"visibility":"off"}]}];
        break;
    case '22':
        mapstyle = [{"featureType":"administrative","stylers":[{"visibility":"on"}]},{"featureType":"poi","stylers":[{"visibility":"on"}]},{"featureType":"road","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"visibility":"on"}]},{"featureType":"transit","stylers":[{"visibility":"on"}]},{"featureType":"landscape","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","stylers":[{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-77}]},{"featureType":"road"}];
        break;
    case '23':
        mapstyle = [{"featureType":"water","elementType":"all","stylers":[{"hue":"#87bcba"},{"saturation":-37},{"lightness":-17},{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"hue":"#4f6b46"},{"saturation":-23},{"lightness":-61},{"visibility":"on"}]},{"featureType":"road","elementType":"all","stylers":[{"hue":"#d38bc8"},{"saturation":-55},{"lightness":13},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"hue":"#ffa200"},{"saturation":100},{"lightness":-22},{"visibility":"on"}]},{"featureType":"road.local","elementType":"all","stylers":[{"hue":"#d38bc8"},{"saturation":-55},{"lightness":-31},{"visibility":"on"}]},{"featureType":"transit","elementType":"all","stylers":[{"hue":"#f69d94"},{"saturation":84},{"lightness":9},{"visibility":"on"}]},{"featureType":"administrative","elementType":"all","stylers":[{"hue":"#d38bc8"},{"saturation":45},{"lightness":36},{"visibility":"on"}]},{"featureType":"administrative.country","elementType":"all","stylers":[{"hue":"#d38bc8"},{"saturation":45},{"lightness":36},{"visibility":"on"}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"hue":"#d38bc8"},{"saturation":45},{"lightness":36},{"visibility":"on"}]},{"featureType":"poi.government","elementType":"all","stylers":[{"hue":"#d38bc8"},{"saturation":35},{"lightness":-19},{"visibility":"on"}]},{"featureType":"poi.school","elementType":"all","stylers":[{"hue":"#d38bc8"},{"saturation":-6},{"lightness":-17},{"visibility":"on"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"hue":"#b2ba70"},{"saturation":-19},{"lightness":-25},{"visibility":"on"}]}];
        break;
    case '24':
        mapstyle = [{"featureType":"water","elementType":"all","stylers":[{"hue":"#e9ebed"},{"saturation":-78},{"lightness":67},{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"on"}]},{"featureType":"road","elementType":"geometry","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":31},{"visibility":"on"}]},{"featureType":"poi","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"on"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"hue":"#e9ebed"},{"saturation":-90},{"lightness":-8},{"visibility":"on"}]},{"featureType":"transit","elementType":"all","stylers":[{"hue":"#e9ebed"},{"saturation":10},{"lightness":69},{"visibility":"on"}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"hue":"#2c2e33"},{"saturation":7},{"lightness":19},{"visibility":"on"}]},{"featureType":"road","elementType":"labels","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":31},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":-2},{"visibility":"on"}]}];
        break;
    case '25':
        mapstyle = [{"stylers":[{"saturation":-100},{"gamma":1}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"on"},{"saturation":50},{"gamma":0},{"hue":"#50a5d1"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#333333"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"weight":0.5},{"color":"#333333"}]},{"featureType":"transit.station","elementType":"labels.icon","stylers":[{"gamma":1},{"saturation":50}]}];
        break;
    case '26':
        mapstyle = [{"featureType":"water","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"landscape","stylers":[{"color":"#f2f2f2"}]},{"featureType":"road","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]}];
        break;
    case '27':
        mapstyle = [{"featureType":"water","elementType":"all","stylers":[{"hue":"#1CB2BD"},{"saturation":53},{"lightness":-44},{"visibility":"on"}]},{"featureType":"road","elementType":"all","stylers":[{"hue":"#1CB2BD"},{"saturation":40}]},{"featureType":"landscape","elementType":"all","stylers":[{"hue":"#BBDC00"},{"saturation":80},{"lightness":-20},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"on"}]}];
        break;
    case '28':
        mapstyle = [{"featureType":"administrative","stylers":[{"visibility":"on"}]},{"featureType":"poi","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-17},{"gamma":0.36}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#3f518c"}]}];
        break;
    case '29':
        mapstyle = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#193341"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#2c5a71"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#29768a"},{"lightness":-37}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#406d80"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#406d80"}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#3e606f"},{"weight":2},{"gamma":0.84}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"weight":0.6},{"color":"#1a3541"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#2c5a71"}]}];
        break;
    case '30':
        mapstyle = [{"featureType":"landscape","stylers":[{"hue":"#00dd00"}]},{"featureType":"road","stylers":[{"hue":"#dd0000"}]},{"featureType":"water","stylers":[{"hue":"#000040"}]},{"featureType":"poi.park","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","stylers":[{"hue":"#ffff00"}]},{"featureType":"road.local","stylers":[{"visibility":"off"}]}];
        break;
    case '31':
        mapstyle = [{"featureType":"landscape","stylers":[{"hue":"#FFE100"},{"saturation":34.48275862068968},{"lightness":-1.490196078431353},{"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#FF009A"},{"saturation":-2.970297029703005},{"lightness":-17.815686274509815},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#FFE100"},{"saturation":8.600000000000009},{"lightness":-4.400000000000006},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#00C3FF"},{"saturation":29.31034482758622},{"lightness":-38.980392156862735},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#0078FF"},{"saturation":0},{"lightness":0},{"gamma":1}]},{"featureType":"poi","stylers":[{"hue":"#00FF19"},{"saturation":-30.526315789473685},{"lightness":-22.509803921568633},{"gamma":1}]}];
        break;
    case '32':
        mapstyle = [{"featureType":"landscape","stylers":[{"hue":"#FFA800"},{"saturation":0},{"lightness":0},{"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#53FF00"},{"saturation":-73},{"lightness":40},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#FBFF00"},{"saturation":0},{"lightness":0},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#00FFFD"},{"saturation":0},{"lightness":30},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#00BFFF"},{"saturation":6},{"lightness":8},{"gamma":1}]},{"featureType":"poi","stylers":[{"hue":"#679714"},{"saturation":33.4},{"lightness":-25.4},{"gamma":1}]}];
        break;
    case '33':
        mapstyle = [{"featureType":"landscape","stylers":[{"hue":"#FFAD00"},{"saturation":50.2},{"lightness":-34.8},{"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#FFAD00"},{"saturation":-19.8},{"lightness":-1.8},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#FFAD00"},{"saturation":72.4},{"lightness":-32.6},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#FFAD00"},{"saturation":74.4},{"lightness":-18},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#00FFA6"},{"saturation":-63.2},{"lightness":38},{"gamma":1}]},{"featureType":"poi","stylers":[{"hue":"#FFC300"},{"saturation":54.2},{"lightness":-14.4},{"gamma":1}]}];
        break;
    case '34':
        mapstyle = [{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e0efef"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#1900ff"},{"color":"#c0e8e8"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill"},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","stylers":[{"color":"#7dcdcd"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":700}]}];
        break;
    case '35':
        mapstyle = [{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#b5cbe4"}]},{"featureType":"landscape","stylers":[{"color":"#efefef"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#83a5b0"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#bdcdd3"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e3eed3"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}];
        break;
    case '36':
        mapstyle = [{"featureType":"water","stylers":[{"color":"#19a0d8"}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"weight":6}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#e85113"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-40}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-20}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"road.highway","elementType":"labels.icon"},{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"landscape","stylers":[{"lightness":20},{"color":"#efe9e4"}]},{"featureType":"landscape.man_made","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"hue":"#11ff00"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"hue":"#4cff00"},{"saturation":58}]},{"featureType":"poi","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#f0e4d3"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-10}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"}]}];
        break;
    case '37':
        mapstyle = [{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]},{"featureType":"landscape","stylers":[{"color":"#f2e5d4"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}];
        break;
    case '38':
        mapstyle = [{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#b5cbe4"}]},{"featureType":"landscape","stylers":[{"color":"#efefef"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#83a5b0"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#bdcdd3"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e3eed3"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}];
        break;
    case '39':
        mapstyle = [{"stylers":[{"hue":"#dd0d0d"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]}];
        break;
    case '40':
        mapstyle = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#ffdfa6"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#b52127"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#c5531b"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#74001b"},{"lightness":-10}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#da3c3c"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#74001b"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#da3c3c"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#990c19"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#74001b"},{"lightness":-8}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#6a0d10"},{"visibility":"on"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#ffdfa6"},{"weight":0.4}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]}];
        break;
    case '41':
        mapstyle = [{"elementType":"geometry","stylers":[{"hue":"#ff4400"},{"saturation":-68},{"lightness":-4},{"gamma":0.72}]},{"featureType":"road","elementType":"labels.icon"},{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"hue":"#0077ff"},{"gamma":3.1}]},{"featureType":"water","stylers":[{"hue":"#00ccff"},{"gamma":0.44},{"saturation":-33}]},{"featureType":"poi.park","stylers":[{"hue":"#44ff00"},{"saturation":-23}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"hue":"#007fff"},{"gamma":0.77},{"saturation":65},{"lightness":99}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"gamma":0.11},{"weight":5.6},{"saturation":99},{"hue":"#0091ff"},{"lightness":-86}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"lightness":-48},{"hue":"#ff5e00"},{"gamma":1.2},{"saturation":-23}]},{"featureType":"transit","elementType":"labels.text.stroke","stylers":[{"saturation":-64},{"hue":"#ff9100"},{"lightness":16},{"gamma":0.47},{"weight":2.7}]}];
        break;
    case '42':
        mapstyle = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#cf3737"},{"saturation":"100"},{"lightness":"71"},{"gamma":"7.79"}]},{"featureType":"road","elementType":"labels.text","stylers":[{"invert_lightness":true}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"visibility":"on"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#413f3e"},{"lightness":17},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#070707"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.highway","elementType":"labels.text","stylers":[{"invert_lightness":true}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"invert_lightness":true}]},{"featureType":"road.highway.controlled_access","elementType":"labels.text","stylers":[{"invert_lightness":true}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"invert_lightness":true},{"gamma":"2.93"}]},{"featureType":"road.arterial","elementType":"labels.text.stroke","stylers":[{"weight":"0.01"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#dba714"},{"lightness":"-12"},{"visibility":"on"},{"saturation":"-92"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"invert_lightness":true}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"weight":"1.70"},{"gamma":"1.87"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19},{"visibility":"on"}]},{"featureType":"transit","elementType":"labels","stylers":[{"visibility":"on"},{"invert_lightness":true}]},{"featureType":"transit","elementType":"labels.text","stylers":[{"invert_lightness":true},{"visibility":"on"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"gamma":"0.00"},{"lightness":"67"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#dba714"},{"lightness":17}]}];
        break;
    case '43':
        mapstyle = [{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e0efef"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#1900ff"},{"color":"#c0e8e8"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":700}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#7dcdcd"}]}];
        break;
    case '44':
        mapstyle = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-100},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-100},{"lightness":40}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-10},{"lightness":30}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":-60},{"lightness":10}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":-60},{"lightness":60}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"},{"saturation":-100},{"lightness":60}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"},{"saturation":-100},{"lightness":60}]}];
        break;
    case '45':
        mapstyle = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#333739"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#2ecc71"}]},{"featureType":"poi","stylers":[{"color":"#2ecc71"},{"lightness":-7}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"lightness":-28}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"visibility":"on"},{"lightness":-15}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"lightness":-18}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"lightness":-34}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#333739"},{"weight":0.8}]},{"featureType":"poi.park","stylers":[{"color":"#2ecc71"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#333739"},{"weight":0.3},{"lightness":10}]}];
        break;
    case '46':
        mapstyle = [{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#165c64"},{"saturation":34},{"lightness":-69},{"visibility":"on"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"hue":"#b7caaa"},{"saturation":-14},{"lightness":-18},{"visibility":"on"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"hue":"#cbdac1"},{"saturation":-6},{"lightness":-9},{"visibility":"on"}]},{"featureType":"road","elementType":"geometry","stylers":[{"hue":"#8d9b83"},{"saturation":-89},{"lightness":-12},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"hue":"#d4dad0"},{"saturation":-88},{"lightness":54},{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"hue":"#bdc5b6"},{"saturation":-89},{"lightness":-3},{"visibility":"simplified"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"hue":"#bdc5b6"},{"saturation":-89},{"lightness":-26},{"visibility":"on"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"hue":"#c17118"},{"saturation":61},{"lightness":-45},{"visibility":"on"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"hue":"#8ba975"},{"saturation":-46},{"lightness":-28},{"visibility":"on"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"hue":"#a43218"},{"saturation":74},{"lightness":-51},{"visibility":"simplified"}]},{"featureType":"administrative.province","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":0},{"lightness":100},{"visibility":"simplified"}]},{"featureType":"administrative.neighborhood","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":0},{"lightness":100},{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"labels","stylers":[{"hue":"#ffffff"},{"saturation":0},{"lightness":100},{"visibility":"off"}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":0},{"lightness":100},{"visibility":"off"}]},{"featureType":"administrative","elementType":"all","stylers":[{"hue":"#3a3935"},{"saturation":5},{"lightness":-57},{"visibility":"off"}]},{"featureType":"poi.medical","elementType":"geometry","stylers":[{"hue":"#cba923"},{"saturation":50},{"lightness":-46},{"visibility":"on"}]}];
        break;
    case '47':
        mapstyle = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#004358"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#1f8a70"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#1f8a70"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#fd7400"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#1f8a70"},{"lightness":-20}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#1f8a70"},{"lightness":-17}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"visibility":"on"},{"weight":0.9}]},{"elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#ffffff"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#1f8a70"},{"lightness":-10}]},{},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#1f8a70"},{"weight":0.7}]}];
        break;
    case '48':
        mapstyle = [{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"visibility":"off"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#abbaa4"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#3f518c"}]},{"featureType":"road.highway","stylers":[{"color":"#ad9b8d"}]}];
        break;
    case '49':
        mapstyle = [{"featureType":"administrative.country","elementType":"geometry.stroke","stylers":[{"color":"#ff0000"},{"visibility":"on"},{"weight":2}]},{"featureType":"administrative.province","elementType":"geometry.stroke","stylers":[{"color":"#ff0000"},{"visibility":"on"},{"weight":2}]}];
        break;
    case '50':
        mapstyle = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#425a68"},{"visibility":"on"}]}];
        break;
    case '51':
        mapstyle = [{"stylers":[{"hue":mapcolor}]}];
        break;    
    case 'default':
        mapstyle = [{"stylers":[{"featureType":"all"}]}];
        break;
    default:
    }
    
    return mapstyle;
}
 
/**
 * Get the type of the map: roadmap, satellite, terrain or hybrid 
 * @param string the type of the map
 * @return the type of the map
 */
function resmap_getMapType(string) {
	if (string == null) return google.maps.MapTypeId.ROADMAP;
    var maptype;
    switch (string.toUpperCase()) {
    case 'ROADMAP':
        maptype = google.maps.MapTypeId.ROADMAP;
        break;
    case 'SATELLITE':
        maptype = google.maps.MapTypeId.SATELLITE;
        break;
    case 'TERRAIN':
        maptype = google.maps.MapTypeId.TERRAIN;
        break;
    case 'HYBRID':
        maptype = google.maps.MapTypeId.HYBRID;
        break;
    default:
        maptype = google.maps.MapTypeId.ROADMAP;
    }
    return maptype;
}

/**
 * Transforms "yes" / "no" strings to true/false boolean values.
 * 
 * @param string a string having "yes" or "no" value
 * @return true if string parameter was "yes"; returns false if string parameter was "no" or otherwise
 */
function resmap_toBool(string) {
	if (string == null) return false;
	switch (string.toLowerCase()) {
        case 'yes':
            string = true;
            break;
        case 'no':
            string = false;
            break;
        default:
            string = false;
            break;
    }
    return string;
}

/**
 * Update the map live preview according to settings 
 */
function resmap_updateMap(pluginurl) {
    // the map div
    var mapdiv = jQuery("#responsive_map");

    // the api key field
    var key = jQuery("#resmap_apikey").val();

    // the address field
    var address = jQuery("#address").val();

    // the description field
    var description = jQuery("#rsdescription").val();
    if (jQuery("#rsdescription").val().trim().length == 0) {
        jQuery("#rsdescription").val(jQuery("#address").val())
    }
    
    // the directions text field
    var directionstext = jQuery("#directionstext").val();

    // the icon size field
    var iconsize = jQuery("#iconsize").val();

    // the map style field 
    var styles='';
    if (jQuery("#style").val() == 0) {
        // custom color
        styles = [{ "stylers": [{"hue": jQuery("#newcolor").val() } ] } ];
        var pstyle = jQuery("#newcolor").val();
    } else {
        // custom style
        styles = resmap_getStyleString(jQuery("#style").val());
        var pstyle = jQuery("#style").val();
    }

    // the scale control field
    var scalecontrol = jQuery("select#scalecontrol").val();
    var scalecontrolBool = resmap_toBool(scalecontrol);

    // the type control field
    var typecontrol = jQuery("select#typecontrol").val();
    var typecontrolBool = resmap_toBool(typecontrol);

    // the street control field
    var streetcontrol = jQuery("select#streetcontrol").val();
    var streetcontrolBool = resmap_toBool(streetcontrol);

    // the locate me field
    var locateme = jQuery("select#locateme").val();
    var locatemeBool = resmap_toBool(locateme);

    // the zoom level field
    var zoom = parseInt(jQuery("select#zoom").val());

    // the zoom control field
    var zoomcontrol = jQuery("select#zoomcontrol").val();
    var zoomcontrolBool = resmap_toBool(zoomcontrol);

    // the draggable field
    var draggable = jQuery("select#draggable").val();
    var draggableBool = resmap_toBool(draggable);

    // the scroll wheel field
    var scrollwheel = jQuery("select#scrollwheel").val();
    var scrollwheelBool = resmap_toBool(scrollwheel);

    // the search box field
    var searchbox = jQuery("select#searchbox").val();
    var searchboxBool = resmap_toBool(searchbox);

    // the clustering field
    var clustering = jQuery("select#clustering").val();
    var clusteringBool = resmap_toBool(clustering);

    // the logging field
    var logging = jQuery("select#logging").val();
    var loggingBool = resmap_toBool(logging);

    // the poi field
    var poi = jQuery("select#poi").val();
    var poiBool = resmap_toBool(poi);

    var noPOI = ', {"featureType":"poi","stylers":[{"visibility": "off"}]}, {"featureType":"transit","stylers":[{"visibility": "off"}]}';
    if (!poiBool) {
        stylesString = JSON.stringify(styles)
        stylesNoPOI = stylesString.substring(0, stylesString.length - 1) + noPOI + ']';
        styles = jQuery.parseJSON(stylesNoPOI);
    }

    // the fullscreen field
    var fullscreen = jQuery("select#fullscreen").val();
    var fullscreenBool = resmap_toBool(fullscreen);

    // the map width field
    var width = jQuery("#width").val() + jQuery("select#widthm").val();

    // the map height field
    var height = jQuery("#height").val() + jQuery("select#heightm").val();

    // the map type field
    var maptype = resmap_getMapType(jQuery("select#maptype").val());

    // the popup field
    var popup = jQuery("select#popup").val();
    var popupBool = resmap_toBool(popup);

    // the refresh field
    var refresh = jQuery("select#refresh").val();
    var refreshBool = resmap_toBool(refresh);

    // the center field
    var center = jQuery("#center").val();
    if (center.trim().length == 0) {
        var lat = null;
        var lng = null;
    } else {
        var coords = center.split(",");
        var lat = coords[0];
        var lng = coords[1];
    }
    
    // the array with addresses
    var addresses = address.split("|");
    var descriptions = description.split("|");
    
    // the array with custom icons
    if (jQuery("#iconurl").val().trim().length != 0) {
        var icons = jQuery("#iconurl").val().split("|");
    }
    
    // build the markers
    var markers = '[';
    var iconsGenerated = '';
    for (var i = 0; i < addresses.length; i++) {
        var addr = addresses[i].replace(new RegExp("'", "g"), "\'");
        var descr = descriptions[i];
        if (descr == null || descr.trim().length == 0) {
            descr = addr
        }
        descr = descr.replace(new RegExp("\"", "g"), "\'").replace(new RegExp("\n", "g"), " ");
        // replace in the html code the {br} expression with < br >  tag
        descr =  descr.replace(new RegExp("{br}", "g"), "<br>"); 
        
        // the custom icon
        if (jQuery("input[name=icon]:checked").val() != "custom") {
            var icon = jQuery("input[name=icon]:checked").val();
            var iconUrl = pluginurl + "/responsive-maps-plugin/includes/icons/" + icon + ".png";
            iconsGenerated += icon;
        } else { 
            icon = jQuery("#iconurl").val();
            if (icons) {
                if(icons[i]) {
                    var iconUrl = icons[i];
                    iconsGenerated += iconUrl.trim();
                } else {
                    var iconUrl = icons[0];
                    iconsGenerated += iconUrl.trim();
                }
            }
        }

        // see if we show popups:
        // 1) if only one address, popup is true or false (what's given in the shortcode)
        // 2) if more addresses and in shortcode popup is true, show the open popup only for first address.
        markerpopup = false;
        if (popupBool) {
            if (addresses.length == 1) {
               markerpopup = true;
            } else if (addresses.length > 1) {
                i == 0 ? (markerpopup = true) : (markerpopup = false);
            }
        }
        
        // add icon separator between icons if not the last icon
        if (i != addresses.length - 1) {
            iconsGenerated += ' | ';
        }
        var html = descr + '<br><strong><a target=\'_blank\' href=\'https://maps.google.com/?daddr=' + encodeURIComponent(addr).replace(new RegExp("'", "g"), "&#39;") + '\'>' + directionstext + '</a></strong>';
        
        // if more markers, add the neccessary "," delimiter between markers
        if (i > 0) markers += ",";
        
        // extract the langitude and longitude; if given, use them, otherwise use the address
        var marker_latitude = null;
        var marker_longitude = null;
        if (addr.trim().length != 0) {
            
            var coordinates = addr.split(",");
            var marker_latitude = coordinates[0];
            var marker_longitude = coordinates[1];
        
            if(marker_latitude.indexOf(".") == -1 ) {
                markers += '{' + '"address": "' + addr + '", "html": "' + html + '", "popup": ' + markerpopup + ', "flat": true, "icon": {"image": "' + iconUrl + '"';
            } else { 
                var coordinates = addr.split(",");
                var lat = coordinates[0];
                var lng = coordinates[1];
                markers += '{' + '"latitude": "' + marker_latitude + '", "longitude": "'+ marker_longitude + '", "html": "' + html + '", "popup": ' + markerpopup + ', "flat": true, "icon": {"image": "' + iconUrl + '"';
            } 

            if (iconsize != undefined ) {
                if (iconsize.trim().length != 0 && iconsize != 0) {
                    markers += ', "iconsize": [' + iconsize + ']';
                }
            }
            markers += '}}';
        } 
    }
    markers += ']';

    // build the map
    mapdiv.gMapResp({
        maptype: maptype,
        log: loggingBool,
        zoom: zoom,
        markers: jQuery.parseJSON(markers),
        zoomControl: zoomcontrolBool,
        draggable: draggableBool,
        mapTypeControl: typecontrolBool,
        scaleControl: scalecontrolBool,
        streetViewControl: streetcontrolBool,
        overviewMapControl: true,
        fullscreenControl: fullscreenBool,
        styles: styles,
        scrollwheel: scrollwheelBool,
        latitude: lat,
        longitude: lng,
        onComplete: function () {
            var gmap = mapdiv.data('gmap').gmap;
            if (clusteringBool) {
                var markerCluster = new MarkerClusterer(gmap, mapdiv.data('gmap').markers, {imagePath: pluginurl + '/responsive-maps-plugin/includes/img/m'});
            }
        }
    });

    // build aditional controls
    gmap = mapdiv.data('gmap').gmap;
    if (searchboxBool) resmap_createSearchBox(gmap);
    if (locatemeBool) resmap_addLocatemeButton(gmap);

    // parse the description to be shown in the popup
    var parsedDescription = jQuery("#rsdescription").val().replace(new RegExp("\"", "g"), "\'").replace(new RegExp("<", "g"), "&lt;").replace(new RegExp(">", "g"), "&gt;");

    // generate the shortcode
    jQuery("#resmap-shortcode").html('[res_map address="' + address + '" description="' + parsedDescription + '" directionstext="' + directionstext + '" icon="' + iconsGenerated + '" iconsize="' + iconsize + '" style="' + pstyle + '" scalecontrol="' + scalecontrol + '" typecontrol="' + typecontrol + '" streetcontrol="' + streetcontrol + '" locateme="' + locateme + '" zoom="' + zoom + '" zoomcontrol="' + zoomcontrol + '" draggable="' + draggable + '" scrollwheel="' + scrollwheel + '" searchbox="' + searchbox + '" clustering="' + clustering + '" logging="' + logging + '" poi="' + poi + '" fullscreen="' + fullscreen + '" popup="' + popup + '" width="' + width + '" height="' + height + '" maptype="' + maptype + '" refresh="' + refresh + '" center="' + center + '" key="' + key + '"]');
}

/**
 * Really Simple Color Picker in jQuery
 *
 * Licensed under the MIT (MIT-LICENSE.txt) licenses.
 *
 * Copyright (c) 2008-2012
 * Lakshan Perera (www.laktek.com) & Daniel Lacy (daniellacy.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

(function ($) {
    /**
     * Create a couple private variables.
    **/
    var selectorOwner,
        activePalette,
        cItterate       = 0,
        templates       = {
            control : $('<div class="colorPicker-picker">&nbsp;</div>'),
            palette : $('<div id="colorPicker_palette" class="colorPicker-palette" />'),
            swatch  : $('<div class="colorPicker-swatch">&nbsp;</div>'),
            hexLabel: $('<label for="colorPicker_hex">Hex</label>'),
            hexField: $('<input type="text" id="colorPicker_hex" />')
        },
        transparent     = "transparent",
        lastColor;

    /**
     * Create our colorPicker function
    **/
    $.fn.colorPicker = function (options) {

        return this.each(function () {
            // Setup time. Clone new elements from our templates, set some IDs, make shortcuts, jazzercise.
            var element      = $(this),
                opts         = $.extend({}, $.fn.colorPicker.defaults, options),
                defaultColor = $.fn.colorPicker.toHex(
                        (element.val().length > 0) ? element.val() : opts.pickerDefault
                    ),
                newControl   = templates.control.clone(),
                newPalette   = templates.palette.clone().attr('id', 'colorPicker_palette-' + cItterate),
                newHexLabel  = templates.hexLabel.clone(),
                newHexField  = templates.hexField.clone(),
                paletteId    = newPalette[0].id,
                swatch, controlText;


            /**
             * Build a color palette.
            **/
            $.each(opts.colors, function (i) {
                swatch = templates.swatch.clone();

                if (opts.colors[i] === transparent) {
                    swatch.addClass(transparent).text('X');
                    $.fn.colorPicker.bindPalette(newHexField, swatch, transparent);
                } else {
                    swatch.css("background-color", "#" + this);
                    $.fn.colorPicker.bindPalette(newHexField, swatch);
                }
                swatch.appendTo(newPalette);
            });


            newHexLabel.attr('for', 'colorPicker_hex-' + cItterate);

            newHexField.attr({
                'id'    : 'colorPicker_hex-' + cItterate,
                'value' : defaultColor
            });

            newHexField.bind("keydown", function (event) {
                if (event.keyCode === 13) {
                    var hexColor = $.fn.colorPicker.toHex($(this).val());
                    $.fn.colorPicker.changeColor(hexColor ? hexColor : element.val());
                }
                if (event.keyCode === 27) {
                    $.fn.colorPicker.hidePalette();
                }
            });

            newHexField.bind("keyup", function (event) {
              var hexColor = $.fn.colorPicker.toHex($(event.target).val());
              $.fn.colorPicker.previewColor(hexColor ? hexColor : element.val());
            });

            $('<div class="colorPicker_hexWrap" />').append(newHexLabel).appendTo(newPalette);

            newPalette.find('.colorPicker_hexWrap').append(newHexField);
            if (opts.showHexField === false) {
                newHexField.hide();
                newHexLabel.hide();
            }

            $("body").append(newPalette);

            newPalette.hide();


            /**
             * Build replacement interface for original color input.
            **/
            newControl.css("background-color", defaultColor);

            newControl.bind("click", function () {
                if( element.is( ':not(:disabled)' ) ) {
                                    $.fn.colorPicker.togglePalette($('#' + paletteId), $(this));
                }
            });

            if( options && options.onColorChange ) {
              newControl.data('onColorChange', options.onColorChange);
            } else {
              newControl.data('onColorChange', function() {} );
            }

            if (controlText = element.data('text'))
                newControl.html(controlText)

            element.after(newControl);

            element.bind("change", function () {
                element.next(".colorPicker-picker").css(
                    "background-color", $.fn.colorPicker.toHex($(this).val())
                );
            });

            element.val(defaultColor);

            // Hide the original input.
            if (element[0].tagName.toLowerCase() === 'input') {
                try {
                    element.attr('type', 'hidden')
                } catch(err) { // oldIE doesn't allow changing of input.type
                    element.css('visibility', 'hidden').css('position', 'absolute')
                }
            } else {
                element.hide();
            }

            cItterate++;
        });
    };

    /**
     * Extend colorPicker with... all our functionality.
    **/
    $.extend(true, $.fn.colorPicker, {
        /**
         * Return a Hex color, convert an RGB value and return Hex, or return false.
         *
         * Inspired by http://code.google.com/p/jquery-color-utils
        **/
        toHex : function (color) {
            // If we have a standard or shorthand Hex color, return that value.
            if (color.match(/[0-9A-F]{6}|[0-9A-F]{3}$/i)) {
                return (color.charAt(0) === "#") ? color : ("#" + color);

            // Alternatively, check for RGB color, then convert and return it as Hex.
            } else if (color.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/)) {
                var c = ([parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10), parseInt(RegExp.$3, 10)]),
                    pad = function (str) {
                        if (str.length < 2) {
                            for (var i = 0, len = 2 - str.length; i < len; i++) {
                                str = '0' + str;
                            }
                        }

                        return str;
                    };

                if (c.length === 3) {
                    var r = pad(c[0].toString(16)),
                        g = pad(c[1].toString(16)),
                        b = pad(c[2].toString(16));

                    return '#' + r + g + b;
                }

            // Otherwise we wont do anything.
            } else {
                return false;

            }
        },

        /**
         * Check whether user clicked on the selector or owner.
        **/
        checkMouse : function (event, paletteId) {
            var selector = activePalette,
                selectorParent = $(event.target).parents("#" + selector.attr('id')).length;

            if (event.target === $(selector)[0] || event.target === selectorOwner[0] || selectorParent > 0) {
                return;
            }

            $.fn.colorPicker.hidePalette();
        },

        /**
         * Hide the color palette modal.
        **/
        hidePalette : function () {
            $(document).unbind("mousedown", $.fn.colorPicker.checkMouse);

            $('.colorPicker-palette').hide();
        },

        /**
         * Show the color palette modal.
        **/
        showPalette : function (palette) {
            var hexColor = selectorOwner.prev("input").val();

            palette.css({
                top: selectorOwner.offset().top + (selectorOwner.outerHeight()),
                left: selectorOwner.offset().left
            });

            $("#color_value").val(hexColor);

            palette.show();

            $(document).bind("mousedown", $.fn.colorPicker.checkMouse);
        },

        /**
         * Toggle visibility of the colorPicker palette.
        **/
        togglePalette : function (palette, origin) {
            // selectorOwner is the clicked .colorPicker-picker.
            if (origin) {
                selectorOwner = origin;
            }

            activePalette = palette;

            if (activePalette.is(':visible')) {
                $.fn.colorPicker.hidePalette();

            } else {
                $.fn.colorPicker.showPalette(palette);

            }
        },

        /**
         * Update the input with a newly selected color.
        **/
        changeColor : function (value) {
            selectorOwner.css("background-color", value);
            selectorOwner.prev("input").val(value).change();

            $.fn.colorPicker.hidePalette();

            selectorOwner.data('onColorChange').call(selectorOwner, $(selectorOwner).prev("input").attr("id"), value);
        },


        /**
         * Preview the input with a newly selected color.
        **/
        previewColor : function (value) {
            selectorOwner.css("background-color", value);
        },

        /**
         * Bind events to the color palette swatches.
        */
        bindPalette : function (paletteInput, element, color) {
            color = color ? color : $.fn.colorPicker.toHex(element.css("background-color"));

            element.bind({
                click : function (ev) {
                    lastColor = color;

                    $.fn.colorPicker.changeColor(color);
                },
                mouseover : function (ev) {
                    lastColor = paletteInput.val();

                    $(this).css("border-color", "#598FEF");

                    paletteInput.val(color);

                    $.fn.colorPicker.previewColor(color);
                },
                mouseout : function (ev) {
                    $(this).css("border-color", "#000");

                    paletteInput.val(selectorOwner.css("background-color"));

                    paletteInput.val(lastColor);

                    $.fn.colorPicker.previewColor(lastColor);
                }
            });
        }
    });

    /**
     * Default colorPicker options.
     *
     * These are publibly available for global modification using a setting such as:
     *
     * $.fn.colorPicker.defaults.colors = ['151337', '111111']
     *
     * They can also be applied on a per-bound element basis like so:
     *
     * $('#element1').colorPicker({pickerDefault: 'efefef', transparency: true});
     * $('#element2').colorPicker({pickerDefault: '333333', colors: ['333333', '111111']});
     *
    **/
    $.fn.colorPicker.defaults = {
        // colorPicker default selected color.
        pickerDefault : "FFFFFF",

        // Default color set.
        colors : [
            '000000', '993300', '333300', '000080', '333399', '333333', '800000', 'FF6600',
            '808000', '008000', '008080', '0000FF', '666699', '808080', 'FF0000', 'FF9900',
            '99CC00', '339966', '33CCCC', '3366FF', '800080', '999999', 'FF00FF', 'FFCC00',
            'FFFF00', '00FF00', '00FFFF', '00CCFF', '993366', 'C0C0C0', 'FF99CC', 'FFCC99',
            'FFFF99', 'CCFFFF', '99CCFF', 'FFFFFF'
        ],

        // If we want to simply add more colors to the default set, use addColors.
        addColors : [],

        // Show hex field
        showHexField: true
    };

})(jQuery);

