<?php
/*
 * Plugin Name: Responsive Google Maps
 * Description: A plugin which adds responsive and styled maps using a simple shortcode: [res_map address="street, city, country"]
 * Version: 1.1
 * Author: Abdullah Thowzif Hameed
 * Text Domain: res_map
 * Domain Path: languages
 * Author URI: https://thowzif.com
 * Plugin URI: https://thowzif.com
 */

/**
 * Include the plugin admin form.
 */
include 'responsive-styled-google-maps-admin.php';

/**
 * Load plugin translations.
 */
function resmap_Load_Plugin_textdomain() {
    load_plugin_textdomain(
        'res_map',
        false,
        basename(dirname(__FILE__)) . '/languages/'
    );
}
add_action('init', 'resmap_load_plugin_textdomain');

/**
 * Add a menu item for plugin's settings.
 */
function resmap_add_options_page() {
    global $resmap_settings_page;
    $resmap_settings_page = add_options_page(
        __('Responsive Styled Google Maps Helper'),
        __('Responsive Styled Google Maps Helper'),
        'manage_options',
        __FILE__,
        'resmap_admin'
    );
}
add_action('admin_menu', 'resmap_add_options_page');

/**
 * Display a 'Settings' link in 'Plugins - > Installed Plugins' page.
 *
 * @param array $links an array containing the 'Settings' link.
 * @param string $file the plugin folder name.
 *
 * @return array $links the formatted array containing the plugin action links.
 */
function resmap_plugin_action_links($links, $file) {
    if ($file == plugin_basename(__FILE__)) {
        $resmap_links = '<a href="'.get_admin_url()
                        .'options-general.php?page=responsive-maps-plugin/responsive-styled-google-maps.php">'
                        .__('Settings').'</a>';
        // Make the 'Settings' link appear first
        array_unshift($links, $resmap_links);
    }
    return $links;
}
add_filter('plugin_action_links', 'resmap_plugin_action_links', 10, 2);

/**
 * Display 'Documentation' and 'Support' links in 'Plugins -> Installed Plugins' page.
 *
 * @param array $links an array containing the Documentation and Support links.
 * @param string $file the plugin folder name.
 *
 * @return array $links the formatted array containing the plugin action links.
 */
function resmap_plugin_row_meta($links, $file) {
    if ($file == plugin_basename(__FILE__)) {
        $documentation_link = 'Add Link';
        $support_link = 'Add Link';
            
        $links[] = $documentation_link;
        $links[] = $support_link;
    }
    return $links;
}
add_filter('plugin_row_meta', 'resmap_plugin_row_meta', 10, 2);

/**
 * Add the stylesheet needed by the plugin.
 */
function resmap_css() {
    wp_enqueue_style('resmap', plugins_url('includes/css/resmap.min.css', __FILE__), false, '4.7');
}
add_action('wp_enqueue_scripts', 'resmap_css');
 
/**
 * Add the scripts needed by the plugin.
 */
function resmap_scripts() {
    // We enqueue scripts later, only when the shortcode function is called, to avoid unneccessary loading in all pages.
}
add_action('wp_enqueue_scripts', 'resmap_scripts');

/**
 * Add the stylesheet needed by the plugin's admin page.
 *
 * @param string $hook the plugin hook.
 */
function resmap_admin_css($hook) {
    // If not on our plugin settings page, return and do not add stylesheets.
    global $resmap_settings_page;
    if ($hook != $resmap_settings_page) {
        return;
    }
        
    // Enqueue the responsive map CSS
    wp_enqueue_style('resmap', plugins_url('includes/css/resmap.min.css', __FILE__), false, '4.7');

    // Enqueue the admin CSS
    wp_enqueue_style('resmap_admin', plugins_url('includes/css/resmap.admin.min.css', __FILE__), false, '4.7');

    // Enqueue UI dialog CSS
    wp_enqueue_style('wp-jquery-ui-dialog');
}
add_action('admin_enqueue_scripts', 'resmap_admin_css');

/**
 * Register and enqueue scripts neccessary for the plugin's admin page
 *
 * @param string $hook the plugin hook.
 */
function resmap_admin_scripts($hook) {
    // If not on our plugin settings page, return and do not add scripts.
    global $resmap_settings_page;
    if ($hook != $resmap_settings_page) {
        return;
    }

    // Enqueue jQuery
    wp_enqueue_script('jquery');
    
    // Enqueue Google Maps API
    $api_url = is_ssl() ? 'https://maps-api-ssl.google.com' : 'http://maps.googleapis.com';

    // The value of the Google Maps API key from database
    $db_api_key = get_option('resmap_apikey', '');
    $api_key = ($db_api_key == '') ? '' : '&key=' . $db_api_key;

    // Enqueue the Google Maps API
    wp_enqueue_script('googlemapsapi', $api_url . '/maps/api/js?v=3.exp&libraries=places' . $api_key, array('jquery'), null, true);

    // Enqueue plugin scripts
    wp_enqueue_script('resmap', plugins_url('includes/js/resmap.min.js', __FILE__), array('jquery', 'googlemapsapi'), '4.7', true);

    // Enqueue admin specific plugin scripts
    wp_enqueue_script('resmap_admin', plugins_url('includes/js/resmap.admin.min.js', __FILE__), array('jquery', 'resmap'), '4.7', true);

    // Enqueue UI dialog script
    wp_enqueue_script('jquery-ui-dialog');
}
add_action('admin_enqueue_scripts', 'resmap_admin_scripts');

/**
 * Returns the correct icon url based on a certain icon color or url.
 *
 * @param string $value an icon color or a link to the icon
 * @return string a full path to icon image
 */
function resmap_getIcon($value) {
    $icon = $value;
    switch (strtolower(trim($value))) {
        case 'black':
            $icon = plugins_url('/includes/icons/black.png', __FILE__);
            break;
        case 'blue':
            $icon = plugins_url('/includes/icons/blue.png', __FILE__);
            break;
        case 'gray':
            $icon = plugins_url('/includes/icons/gray.png', __FILE__);
            break;
        case 'green':
            $icon = plugins_url('/includes/icons/green.png', __FILE__);
            break;
        case 'magenta':
            $icon = plugins_url('/includes/icons/magenta.png', __FILE__);
            break;
        case 'orange':
            $icon = plugins_url('/includes/icons/orange.png', __FILE__);
            break;
        case 'purple':
            $icon = plugins_url('/includes/icons/purple.png', __FILE__);
            break;
        case 'red':
            $icon = plugins_url('/includes/icons/red.png', __FILE__);
            break;
        case 'white':
            $icon = plugins_url('/includes/icons/white.png', __FILE__);
            break;
        case 'yellow':
            $icon = plugins_url('/includes/icons/yellow.png', __FILE__);
            break;
        case '':
            $icon = plugins_url('/includes/icons/gray.png', __FILE__);
            break;
        case 'default':
            $icon = plugins_url('/includes/icons/gray.png', __FILE__);
            break;
    }
    
    return $icon;
}

/**
 * Transforms "yes" / "no" strings to true/false boolean values.
 *
 * @param string a string having "yes" or "no" value
 * @return true if string parameter was "yes"; returns false if string parameter was "no" or otherwise
 */
function resmap_toBool($string) {
    switch (strtolower($string)) {
        case 'yes':
            $string = 'true';
            break;
        case 'no':
            $string = 'false';
            break;
        default:
            $string = 'false';
            break;
    }
    return $string;
}

/**
 * Returns the map style.
 * @param style the style id between 1-50 or given as hex color code (#ff0000).
 * @return a JSON string representing the style to be applied to the map
 */
function getStyleString($style) {
    $styleString;
    // If the style is given with a hex color in the shortcode, colot the map with that specific hex color
    if (strpos($style, '#') === 0) {
        $styleString = '[{ "stylers": [{"hue": "' . $style . '" } ] } ]';
        return $styleString;
    }
    switch ($style) {
        case '1':
            $styleString = '[{"stylers":[{"featureType":"all"}]}]';
            break;
        case '2':
            $styleString = '[{"stylers":[{"featureType":"all"},{"saturation":-100},{"gamma":0.50},{"lightness":30}]}]';
            break;
        case '3':
            $styleString = '[{"stylers":[{"invert_lightness":true},{"visibility":"on"}]}]';
            break;
        case '4':
            $styleString = '[{"stylers":[{"invert_lightness":true},{"hue":"#0000b0"},{"saturation":-30}]}]';
            break;
        case '5':
            $styleString = '[{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]},{"featureType":"landscape","stylers":[{"color":"#f2e5d4"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}]';
            break;
        case '6':
            $styleString = '[{"stylers":[{"lightness":10},{"gamma":1.2},{"saturation":-20},{"visibility":"on"},{"weight":0.1},{"hue":"#00ccff"}]}]';
            break;
        case '7':
            $styleString = '[{"stylers":[{"saturation":-20},{"visibility":"on"},{"hue":"#00ccff"},{"invert_lightness":true},{"lightness":5}]}]';
            break;
        case '8':
            $styleString = '[{"stylers":[{"saturation":-20},{"visibility":"on"},{"lightness":5},{"hue":"#ff004c"},{"gamma":1.45}]}]';
            break;
        case '9':
            $styleString = '[{"featureType":"water","stylers":[{"color":"#021019"}]},{"featureType":"landscape","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"transit","stylers":[{"color":"#146474"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]}]';
            break;
        case '10':
            $styleString = '[{"stylers":[{"visibility":"on"},{"saturation":-30},{"hue":"#ccff00"},{"lightness":-20},{"gamma":1},{"weight":0.1},{"invert_lightness":true}]}]';
            break;
        case '11':
            $styleString = '[{"stylers":[{"hue":"#00ccff"},{"saturation":5},{"lightness":-20}]}]';
            break;
        case '12':
            $styleString = '[{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"hue":149},{"saturation":-78},{"lightness":0}]},{"featureType":"road.highway","stylers":[{"hue":-31},{"saturation":-40},{"lightness":2.8}]},{"featureType":"poi","elementType":"label","stylers":[{"visibility":"off"}]},{"featureType":"landscape","stylers":[{"hue":163},{"saturation":-26},{"lightness":-1.1}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"water","stylers":[{"hue":3},{"saturation":-24.24},{"lightness":-38.57}]}]';
            break;
        case '13':
            $styleString = '[{"stylers":[{"gamma":1.58},{"saturation":30},{"weight":0.1}]}]';
            break;
        case '14':
            $styleString = '[{"stylers":[{"invert_lightness":true},{"weight":0.1},{"hue":"#00ffa2"},{"visibility":"on"},{"saturation":-120},{"lightness":10},{"gamma":1.2}]}]';
            break;
        case '15':
            $styleString = '[{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#00ccff"},{"weight":0.1},{"saturation":80}]},{"featureType":"road.local","elementType": "geometry","stylers":[{"visibility":"on"},{"lightness":30}]},{"featureType":"transit","stylers":[{"hue":"#0077ff"},{"lightness":100},{"color":"#141480"},{"visibility":"simplified"},{ "saturation":-30},{"gamma":0.96},{"invert_lightness":true}]},{"featureType":"administrative.neighborhood","stylers":[{"invert_lightness":true},{"visibility":"on"}]},{"featureType": "road.highway.controlled_access","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","stylers":[{"weight":0.1}]},{"featureType":"road.local","stylers":[{ "visibility":"off"}]},{"featureType":"administrative","stylers":[{"invert_lightness":true},{"hue":"#00ff66"},{"saturation":30},{"lightness":-20},{"gamma":1.91}]},{"stylers":[{ "weight":0.1}]}]';
            break;
        case '16':
            $styleString = '[{"featureType":"road","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"visibility":"off"}]},{"featureType":"administrative","stylers":[{ "weight":0.9}]}]';
            break;
        case '17':
            $styleString = '[{"stylers":[{"hue":"#ffd500"},{"lightness":-30}]}]';
            break;
        case '18':
            $styleString = '[{"featureType":"road","stylers":[{"hue":"#e6ff00"}]},{"featureType":"road","stylers":[{"visibility":"on" },{"weight":0.1},{"lightness":10},{"gamma":0.96}]},{ "featureType":"administrative","elementType":"labels.icon","stylers":[{"visibility":"simplified"},{"weight":0.1}]},{"stylers":[{"hue":"#0019ff"},{"lightness":10},{"gamma":0.96}]},{ "stylers":[{"gamma":0.96},{"weight":0.1}]},{"featureType":"administrative","stylers":[{"color":"#328080"}]}]';
            break;
        case '19':
            $styleString = '[{"featureType":"road","stylers":[{"lightness":-10},{"weight":0.1},{"hue":"#008000"}]},{"stylers":[{"saturation":30},{"lightness":-10}]}]';
            break;
        case '20':
            $styleString = '[{"stylers":[{"visibility":"on"},{"weight":0.9},{"hue":"#005eff"},{"lightness":-10},{"gamma":1.2}]}]';
            break;
        case '21':
            $styleString = '[{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#aee2e0"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#abce83"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#769E72"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#7B8758"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"color":"#EBF4A4"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"visibility":"simplified"},{"color":"#8dab68"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#5B5B3F"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ABCE83"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#A4C67D"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#9BBF72"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#EBF4A4"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#87ae79"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#7f2200"},{"visibility":"off"}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"visibility":"on"},{"weight":4.1}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#495421"}]},{"featureType":"administrative.neighborhood","elementType":"labels","stylers":[{"visibility":"off"}]}]';
            break;
        case '22':
            $styleString = '[{"featureType":"administrative","stylers":[{"visibility":"on"}]},{"featureType":"poi","stylers":[{"visibility":"on"}]},{"featureType":"road","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"visibility":"on"}]},{"featureType":"transit","stylers":[{"visibility":"on"}]},{"featureType":"landscape","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","stylers":[{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-77}]},{"featureType":"road"}]';
            break;
        case '23':
            $styleString = '[{"featureType":"water","elementType":"all","stylers":[{"hue":"#87bcba"},{"saturation":-37},{"lightness":-17},{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"hue":"#4f6b46"},{"saturation":-23},{"lightness":-61},{"visibility":"on"}]},{"featureType":"road","elementType":"all","stylers":[{"hue":"#d38bc8"},{"saturation":-55},{"lightness":13},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"hue":"#ffa200"},{"saturation":100},{"lightness":-22},{"visibility":"on"}]},{"featureType":"road.local","elementType":"all","stylers":[{"hue":"#d38bc8"},{"saturation":-55},{"lightness":-31},{"visibility":"on"}]},{"featureType":"transit","elementType":"all","stylers":[{"hue":"#f69d94"},{"saturation":84},{"lightness":9},{"visibility":"on"}]},{"featureType":"administrative","elementType":"all","stylers":[{"hue":"#d38bc8"},{"saturation":45},{"lightness":36},{"visibility":"on"}]},{"featureType":"administrative.country","elementType":"all","stylers":[{"hue":"#d38bc8"},{"saturation":45},{"lightness":36},{"visibility":"on"}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"hue":"#d38bc8"},{"saturation":45},{"lightness":36},{"visibility":"on"}]},{"featureType":"poi.government","elementType":"all","stylers":[{"hue":"#d38bc8"},{"saturation":35},{"lightness":-19},{"visibility":"on"}]},{"featureType":"poi.school","elementType":"all","stylers":[{"hue":"#d38bc8"},{"saturation":-6},{"lightness":-17},{"visibility":"on"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"hue":"#b2ba70"},{"saturation":-19},{"lightness":-25},{"visibility":"on"}]}]';
            break;
        case '24':
            $styleString = '[{"featureType":"water","elementType":"all","stylers":[{"hue":"#e9ebed"},{"saturation":-78},{"lightness":67},{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"on"}]},{"featureType":"road","elementType":"geometry","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":31},{"visibility":"on"}]},{"featureType":"poi","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"on"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"hue":"#e9ebed"},{"saturation":-90},{"lightness":-8},{"visibility":"on"}]},{"featureType":"transit","elementType":"all","stylers":[{"hue":"#e9ebed"},{"saturation":10},{"lightness":69},{"visibility":"on"}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"hue":"#2c2e33"},{"saturation":7},{"lightness":19},{"visibility":"on"}]},{"featureType":"road","elementType":"labels","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":31},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"hue":"#bbc0c4"},{"saturation":-93},{"lightness":-2},{"visibility":"on"}]}]';
            break;
        case '25':
            $styleString = '[{"stylers":[{"saturation":-100},{"gamma":1}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"poi.place_of_worship","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"on"},{"saturation":50},{"gamma":0},{"hue":"#50a5d1"}]},{"featureType":"administrative.neighborhood","elementType":"labels.text.fill","stylers":[{"color":"#333333"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"weight":0.5},{"color":"#333333"}]},{"featureType":"transit.station","elementType":"labels.icon","stylers":[{"gamma":1},{"saturation":50}]}]';
            break;
        case '26':
            $styleString = '[{"featureType":"water","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"landscape","stylers":[{"color":"#f2f2f2"}]},{"featureType":"road","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]}]';
            break;
        case '27':
            $styleString = '[{"featureType":"water","elementType":"all","stylers":[{"hue":"#1CB2BD"},{"saturation":53},{"lightness":-44},{"visibility":"on"}]},{"featureType":"road","elementType":"all","stylers":[{"hue":"#1CB2BD"},{"saturation":40}]},{"featureType":"landscape","elementType":"all","stylers":[{"hue":"#BBDC00"},{"saturation":80},{"lightness":-20},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"on"}]}]';
            break;
        case '28':
            $styleString = '[{"featureType":"administrative","stylers":[{"visibility":"on"}]},{"featureType":"poi","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-17},{"gamma":0.36}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#3f518c"}]}]';
            break;
        case '29':
            $styleString = '[{"featureType":"water","elementType":"geometry","stylers":[{"color":"#193341"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#2c5a71"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#29768a"},{"lightness":-37}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#406d80"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#406d80"}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#3e606f"},{"weight":2},{"gamma":0.84}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"weight":0.6},{"color":"#1a3541"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#2c5a71"}]}]';
            break;
        case '30':
            $styleString = '[{"featureType":"landscape","stylers":[{"hue":"#00dd00"}]},{"featureType":"road","stylers":[{"hue":"#dd0000"}]},{"featureType":"water","stylers":[{"hue":"#000040"}]},{"featureType":"poi.park","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","stylers":[{"hue":"#ffff00"}]},{"featureType":"road.local","stylers":[{"visibility":"off"}]}]';
            break;
        case '31':
            $styleString = '[{"featureType":"landscape","stylers":[{"hue":"#FFE100"},{"saturation":34.48275862068968},{"lightness":-1.490196078431353},{"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#FF009A"},{"saturation":-2.970297029703005},{"lightness":-17.815686274509815},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#FFE100"},{"saturation":8.600000000000009},{"lightness":-4.400000000000006},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#00C3FF"},{"saturation":29.31034482758622},{"lightness":-38.980392156862735},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#0078FF"},{"saturation":0},{"lightness":0},{"gamma":1}]},{"featureType":"poi","stylers":[{"hue":"#00FF19"},{"saturation":-30.526315789473685},{"lightness":-22.509803921568633},{"gamma":1}]}]';
            break;
        case '32':
            $styleString = '[{"featureType":"landscape","stylers":[{"hue":"#FFA800"},{"saturation":0},{"lightness":0},{"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#53FF00"},{"saturation":-73},{"lightness":40},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#FBFF00"},{"saturation":0},{"lightness":0},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#00FFFD"},{"saturation":0},{"lightness":30},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#00BFFF"},{"saturation":6},{"lightness":8},{"gamma":1}]},{"featureType":"poi","stylers":[{"hue":"#679714"},{"saturation":33.4},{"lightness":-25.4},{"gamma":1}]}]';
            break;
        case '33':
            $styleString = '[{"featureType":"landscape","stylers":[{"hue":"#FFAD00"},{"saturation":50.2},{"lightness":-34.8},{"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#FFAD00"},{"saturation":-19.8},{"lightness":-1.8},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#FFAD00"},{"saturation":72.4},{"lightness":-32.6},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#FFAD00"},{"saturation":74.4},{"lightness":-18},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#00FFA6"},{"saturation":-63.2},{"lightness":38},{"gamma":1}]},{"featureType":"poi","stylers":[{"hue":"#FFC300"},{"saturation":54.2},{"lightness":-14.4},{"gamma":1}]}]';
            break;
        case '34':
            $styleString = '[{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e0efef"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#1900ff"},{"color":"#c0e8e8"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill"},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","stylers":[{"color":"#7dcdcd"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":700}]}]';
            break;
        case '35':
            $styleString = '[{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#b5cbe4"}]},{"featureType":"landscape","stylers":[{"color":"#efefef"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#83a5b0"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#bdcdd3"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e3eed3"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}]';
            break;
        case '36':
            $styleString = '[{"featureType":"water","stylers":[{"color":"#19a0d8"}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"weight":6}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#e85113"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-40}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#efe9e4"},{"lightness":-20}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"road.highway","elementType":"labels.icon"},{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"landscape","stylers":[{"lightness":20},{"color":"#efe9e4"}]},{"featureType":"landscape.man_made","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"lightness":-100}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"hue":"#11ff00"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"hue":"#4cff00"},{"saturation":58}]},{"featureType":"poi","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#f0e4d3"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#efe9e4"},{"lightness":-10}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"}]}]';
            break;
        case '37':
            $styleString = '[{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]},{"featureType":"landscape","stylers":[{"color":"#f2e5d4"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}]';
            break;
        case '38':
            $styleString = '[{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#b5cbe4"}]},{"featureType":"landscape","stylers":[{"color":"#efefef"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#83a5b0"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#bdcdd3"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#e3eed3"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}]';
            break;
        case '39':
            $styleString = '[{"stylers":[{"hue":"#dd0d0d"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]}]';
            break;
        case '40':
            $styleString = '[{"featureType":"water","elementType":"geometry","stylers":[{"color":"#ffdfa6"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#b52127"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#c5531b"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#74001b"},{"lightness":-10}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#da3c3c"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#74001b"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#da3c3c"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"#990c19"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#74001b"},{"lightness":-8}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#6a0d10"},{"visibility":"on"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#ffdfa6"},{"weight":0.4}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]}]';
            break;
        case '41':
            $styleString = '[{"elementType":"geometry","stylers":[{"hue":"#ff4400"},{"saturation":-68},{"lightness":-4},{"gamma":0.72}]},{"featureType":"road","elementType":"labels.icon"},{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"hue":"#0077ff"},{"gamma":3.1}]},{"featureType":"water","stylers":[{"hue":"#00ccff"},{"gamma":0.44},{"saturation":-33}]},{"featureType":"poi.park","stylers":[{"hue":"#44ff00"},{"saturation":-23}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"hue":"#007fff"},{"gamma":0.77},{"saturation":65},{"lightness":99}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"gamma":0.11},{"weight":5.6},{"saturation":99},{"hue":"#0091ff"},{"lightness":-86}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"lightness":-48},{"hue":"#ff5e00"},{"gamma":1.2},{"saturation":-23}]},{"featureType":"transit","elementType":"labels.text.stroke","stylers":[{"saturation":-64},{"hue":"#ff9100"},{"lightness":16},{"gamma":0.47},{"weight":2.7}]}]';
            break;
        case '42':
            $styleString = '[{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"color":"#cf3737"},{"saturation":"100"},{"lightness":"71"},{"gamma":"7.79"}]},{"featureType":"road","elementType":"labels.text","stylers":[{"invert_lightness":true}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"visibility":"on"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#413f3e"},{"lightness":17},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#070707"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.highway","elementType":"labels.text","stylers":[{"invert_lightness":true}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"invert_lightness":true}]},{"featureType":"road.highway.controlled_access","elementType":"labels.text","stylers":[{"invert_lightness":true}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"invert_lightness":true},{"gamma":"2.93"}]},{"featureType":"road.arterial","elementType":"labels.text.stroke","stylers":[{"weight":"0.01"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#dba714"},{"lightness":"-12"},{"visibility":"on"},{"saturation":"-92"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"invert_lightness":true}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"weight":"1.70"},{"gamma":"1.87"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19},{"visibility":"on"}]},{"featureType":"transit","elementType":"labels","stylers":[{"visibility":"on"},{"invert_lightness":true}]},{"featureType":"transit","elementType":"labels.text","stylers":[{"invert_lightness":true},{"visibility":"on"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"gamma":"0.00"},{"lightness":"67"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#dba714"},{"lightness":17}]}]';
            break;
        case '43':
            $styleString = '[{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e0efef"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#1900ff"},{"color":"#c0e8e8"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":700}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#7dcdcd"}]}]';
            break;
        case '44':
            $styleString = '[{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-100},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-100},{"lightness":40}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"saturation":-10},{"lightness":30}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":-60},{"lightness":10}]},{"featureType":"landscape.natural","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":-60},{"lightness":60}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"},{"saturation":-100},{"lightness":60}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"},{"saturation":-100},{"lightness":60}]}]';
            break;
        case '45':
            $styleString = '[{"featureType":"water","elementType":"geometry","stylers":[{"color":"#333739"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#2ecc71"}]},{"featureType":"poi","stylers":[{"color":"#2ecc71"},{"lightness":-7}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"lightness":-28}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"visibility":"on"},{"lightness":-15}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"lightness":-18}]},{"elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2ecc71"},{"lightness":-34}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"visibility":"on"},{"color":"#333739"},{"weight":0.8}]},{"featureType":"poi.park","stylers":[{"color":"#2ecc71"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#333739"},{"weight":0.3},{"lightness":10}]}]';
            break;
        case '46':
            $styleString = '[{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#165c64"},{"saturation":34},{"lightness":-69},{"visibility":"on"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"hue":"#b7caaa"},{"saturation":-14},{"lightness":-18},{"visibility":"on"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"hue":"#cbdac1"},{"saturation":-6},{"lightness":-9},{"visibility":"on"}]},{"featureType":"road","elementType":"geometry","stylers":[{"hue":"#8d9b83"},{"saturation":-89},{"lightness":-12},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"hue":"#d4dad0"},{"saturation":-88},{"lightness":54},{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"hue":"#bdc5b6"},{"saturation":-89},{"lightness":-3},{"visibility":"simplified"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"hue":"#bdc5b6"},{"saturation":-89},{"lightness":-26},{"visibility":"on"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"hue":"#c17118"},{"saturation":61},{"lightness":-45},{"visibility":"on"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"hue":"#8ba975"},{"saturation":-46},{"lightness":-28},{"visibility":"on"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"hue":"#a43218"},{"saturation":74},{"lightness":-51},{"visibility":"simplified"}]},{"featureType":"administrative.province","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":0},{"lightness":100},{"visibility":"simplified"}]},{"featureType":"administrative.neighborhood","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":0},{"lightness":100},{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"labels","stylers":[{"hue":"#ffffff"},{"saturation":0},{"lightness":100},{"visibility":"off"}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":0},{"lightness":100},{"visibility":"off"}]},{"featureType":"administrative","elementType":"all","stylers":[{"hue":"#3a3935"},{"saturation":5},{"lightness":-57},{"visibility":"off"}]},{"featureType":"poi.medical","elementType":"geometry","stylers":[{"hue":"#cba923"},{"saturation":50},{"lightness":-46},{"visibility":"on"}]}]';
            break;
        case '47':
            $styleString = '[{"featureType":"water","elementType":"geometry","stylers":[{"color":"#004358"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#1f8a70"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#1f8a70"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#fd7400"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#1f8a70"},{"lightness":-20}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#1f8a70"},{"lightness":-17}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"},{"visibility":"on"},{"weight":0.9}]},{"elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"color":"#ffffff"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#1f8a70"},{"lightness":-10}]},{},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#1f8a70"},{"weight":0.7}]}]';
            break;
        case '48':
            $styleString = '[{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"visibility":"off"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#abbaa4"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#3f518c"}]},{"featureType":"road.highway","stylers":[{"color":"#ad9b8d"}]}]';
            break;
        case '49':
            $styleString = '[{"featureType":"administrative.country","elementType":"geometry.stroke","stylers":[{"color":"#ff0000"},{"visibility":"on"},{"weight":2}]},{"featureType":"administrative.province","elementType":"geometry.stroke","stylers":[{"color":"#ff0000"},{"visibility":"on"},{"weight":2}]}]';
            break;
        case '50':
            $styleString = '[{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#425a68"},{"visibility":"on"}]}]';
            break;
        default:
            $styleString = '[{"stylers":[{"featureType":"all"}]}]';
            break;
    }
    return $styleString;
}

/**
 * Clean the given parameter: encodes line ending to empty space and {br} to <br>
 *
 * @param string $attr the html code to be proccessed
 * @return string the processed string.
 */
function resmap_cleanHtml($attr) {
    $attr = str_replace(array("\n", '"', "'", "{br}", "&lt;", "&gt;", "\r\n"), array(" ", "\"", "\'", "<br>", "<", ">", " "), $attr);

    return $attr;
}

/**
 * Define the shortcode: [res_map] and its attributes
 *
 * @param array the array containing shortcode parameters
 */
function resmap_shortcode($atts) {

    // Extract the attributes from the shortcode
    $atts = shortcode_atts(array(
      'width'           => '100%',    // Use a width in 'px' or '%'. Default: 100%
      'height'          => '500px',   // Use a height in 'px' or '%'. Default: 500px
      'maptype'         => 'roadmap', // Possible values: roadmap, satellite, terrain or hybrid
      'zoom'            => 14,        // Zoom, use values between 1-19, default zoom=14
      'address'         => '',        // Markers list in this format: street, city, country | street, city, country | street, city, country
      'description'     => '',        // Markers descriptions in this format: description1 | description2 | description3 (one for each marker address above)
      'popup'           => 'no',      // 'yes' or 'no'
      'pancontrol'      => 'no',      // 'yes' or 'no'
      'zoomcontrol'     => 'no',      // 'yes' or 'no'
      'draggable'       => 'yes',     // 'yes' or 'no'
      'scrollwheel'     => 'no',      // 'yes' or 'no'
      'typecontrol'     => 'no',      // 'yes' or 'no'
      'scalecontrol'    => 'no',      // 'yes' or 'no'
      'streetcontrol'   => 'no',      // 'yes' or 'no'
      'searchbox'       => 'no',      // 'yes' or 'no'
      'clustering'      => 'no',      // 'yes' or 'no'
      'logging'         => 'no',      // 'yes' or 'no'
      'poi'             => 'yes',     // 'yes' or 'no'
      'directionstext'  => '',        // The text to be displayed for directions link
      'center'          => '',        // The point where the map should be centered (latitude, longitude) for instance: center="38.980288, 22.145996"
      'icon'            => 'green',   // Possible color values: black, blue, gray, green, magenta, orange, purple, red, white, yellow or a http link to a custom image
      'iconsize'        => '',        // Icon size
      'style'           => '1',       // Use style values between 1-50
      'refresh'         => 'no',      // 'yes' or 'no'
      'locateme'        => 'no',      // 'yes' or 'no'
      'fullscreen'      => 'no',      // 'yes' or 'no'
      'key'             => ''         // Google Maps API key

    ), $atts);

    // Enque jQuery
    wp_enqueue_script('jquery');

    // Save the Google Maps API key from the shortcode in the database
    $api_key = $atts['key'];

    if (isset($api_key)) {
        // Sanitize it
        $api_key = sanitize_text_field($api_key);
        // And save it in the database
        if ($api_key != "") {
            update_option('resmap_apikey', $api_key);
        }
    }

    // Enqueue Google Maps required scripts at the end of body, before of closing body tag (to prevent being overriden by other plugins)
    add_action('wp_footer', 'resmap_enqueue_scripts');

    // Generate a unique identifier for the map
    $mapid = rand();

    // Extract the map type
    $atts['maptype'] = strtoupper($atts['maptype']);

    // If width or height were specified in the shortcode, extract them too
    $dimensions = '';
    if (isset($atts['height'])) {
        $dimensions .= 'height:' . $atts['height'] . ';';
    }
    if (isset($atts['width'])) {
        $dimensions .= 'width:' . $atts['width'] . ';';
    }

    // Set the pre-defined style which corresponds to the number given in the shortcode
    $atts['style'] = getStyleString($atts['style']);

    // If points of interest (poi) is set to "no" in the shortcode, add this option to the style string
    // And this is the JSON for no points of interest: ', { "featureType": "poi", "stylers": [ { "visibility": "off" } ] }'
    $noPOI = ', {"featureType":"poi","stylers":[{"visibility": "off"}]}';
    if (isset($atts['poi']) && $atts['poi'] == 'no') {
        $atts['style'] = substr($atts['style'], 0, -1) . $noPOI . ']';
    }

    // Extract the langitude and longitude for the map center
    if (trim($atts['center'])  != "") {
        sscanf($atts['center'], '%f, %f', $lat, $long);
    } else {
        $lat = 'null';
        $long = 'null';
    }

    // Prepare markers list
    $markers = '[]';

    // Split the addresses, descriptions and icons (by the pipeline "|" delimiter)
    if ($atts['address'] != '') {
        $addresses = explode("|", $atts['address']);
        $total_addresses = count($addresses);
        $descriptions = explode("|", $atts['description']);
        $icons = explode("|", $atts['icon']);

      // Start building the markers JSON array
        $markers = '[';

      // For each address from the list, build a marker (with popup with description and an icon)
        for ($i = 0; $i < $total_addresses; $i ++) {
            // Remove unneccessary line breaks from the addresses list
            $address = resmap_cleanHtml($addresses[$i]);

            $html = "<div id='resmap_popup'>";
            
            // If it's empty, set the default description equal to the the address
            if (isset($descriptions[$i]) && strlen(trim($descriptions[$i])) != 0) {
                $html .= $descriptions[$i];
            } else {
                $html .= $address;
            }
                
            // Add the directions link to the description
            if (isset($atts['directionstext']) && strlen(trim($atts['directionstext'])) != 0) {
                $directions = 'https://maps.google.com/?daddr=' . urlencode($address);
                $html .= "<br><strong><a target='_blank' href='". $directions ."'>". $atts['directionstext'] ."</a></strong>" ;
            }
                
            // Remove unneccessary line breaks from the $html and transforms {br} to <br>
            $html = resmap_cleanHtml($html);
            $html .= "</div>";
            
            // Get the correct icon image based on icon color/url which were given in the shortcode
            if (isset($icons[$i])) {
                $icon = resmap_getIcon($icons[$i]);
            }

            // Extract the lagitude and longitude
            $marker_latitude = null;
            $marker_longitude = null;
            if (trim($address)  != "") {
                sscanf($address, '%f, %f', $marker_latitude, $marker_longitude);
            }

            // See if we show popups.
            // If only one address, popup is true or false (what's given in the shortcode)
            // If more addresses and in shortcode popup is true, show the open popup only for first address.
            $popup = 'false';
            if (isset($atts['popup']) && $atts['popup'] == 'yes') {
                if ($total_addresses == 1) {
                    $popup = 'true';
                } elseif ($total_addresses >= 1) {
                    $i == 0 ? ($popup = 'true') : ($popup = 'false');
                }
            }

            // If more markers, add the neccessary "," delimiter between markers
            if ($i > 0) {
                $markers .= ",";
            }
            
            // Build markers list based on given address or latitude/longitude
            if ($marker_latitude == '' || $marker_longitude == '') {
                $markers .= "{
                        address: '" . $address . "', 
                        key: '". ($i + 1)  . "',";
            } else {
                $markers .= "{
                        latitude:" . $marker_latitude .", 
                        longitude:" . $marker_longitude .",
                        key: '" . ($i +1) . "',";
            }
              $markers .= "html:'" . $html . "',
                        popup: ". $popup . ",
                        flat: true,
                        icon: {
                            image: '". $icon . "'";
            if (trim($atts['iconsize'])  != "") {
                $markers .= ", iconsize: [" . $atts['iconsize'] . "]";
            }
              $markers .= "}}";
        }
        $markers .= ']';
    }
    // Tell PHP to start output buffering
    ob_start();
    ?><script type="text/javascript">
    jQuery(document).ready(function($) {
        // the div that will contain the map
        var mapdiv = jQuery("#responsive_map_<?php echo $mapid; ?>"); 
        // markers should be clustered?
        var clustering = "<?php echo $atts['clustering']; ?>"; 
        // Create the map in the div 
        mapdiv.gMapResp({
            maptype: google.maps.MapTypeId.<?php echo $atts['maptype']; ?>,
            log: <?php echo resmap_toBool($atts['logging']); ?>,
            zoom: <?php echo $atts['zoom']; ?>,
            markers: <?php echo $markers; ?>,
            panControl: <?php echo resmap_toBool($atts['pancontrol']); ?>,
            zoomControl: <?php echo resmap_toBool($atts['zoomcontrol']); ?>,
            draggable: <?php echo resmap_toBool($atts['draggable']); ?>,
            scrollwheel: <?php echo resmap_toBool($atts['scrollwheel']); ?>,
            mapTypeControl: <?php echo resmap_toBool($atts['typecontrol']); ?>,
            scaleControl: <?php echo resmap_toBool($atts['scalecontrol']); ?>,
            streetViewControl: <?php echo resmap_toBool($atts['streetcontrol']); ?>,
            overviewMapControl: true,
            fullscreenControl: <?php echo resmap_toBool($atts['fullscreen']); ?>,
            styles: <?php echo $atts['style']; ?>,
            latitude: <?php echo $lat; ?>,
            longitude: <?php echo $long; ?>,
            onComplete: function() {
                var gmap = mapdiv.data('gmap').gmap;
                if (clustering.length  != 0 && clustering == "yes") {
                    var markerCluster = new MarkerClusterer(gmap, mapdiv.data('gmap').markers, {imagePath: '<?php echo esc_url(plugins_url()); ?>/responsive-maps-plugin/includes/img/m'});
                }
            }
        });
        gmap = mapdiv.data('gmap').gmap;
    <?php if (isset($atts['searchbox']) && $atts['searchbox'] == 'yes') { ?>
    resmap_createSearchBox(gmap);
    <?php }
if (isset($atts['locateme']) && $atts['locateme'] == 'yes') { ?>
    resmap_addLocatemeButton(gmap);
<?php } ?>
    });
    <?php if (isset($atts['refresh']) && $atts['refresh'] == 'yes') { ?>
    window.onresize = function() {
        jQuery('.responsive-map').each(function(i, obj) {
            jQuery(this).gMapResp('fixAfterResize');
        });
    };
    <?php } ?>
  </script>
    <div id="responsive_map_<?php echo $mapid; ?>" class="responsive-map" style="<?php echo $dimensions; ?>"></div><?php return ob_get_clean();
}
add_shortcode('res_map', 'resmap_shortcode');

/**
 * Enqueue the required Google Maps scripts.
 */
function resmap_enqueue_scripts() {
    // Google Maps API link, http or https
    $api_url = is_ssl() ? 'https://maps-api-ssl.google.com' : 'http://maps.googleapis.com';

    // The value of the Google Maps API key from database
    $db_api_key = get_option('resmap_apikey', '');
    $api_key = ($db_api_key == '') ? '' : '&key=' . $db_api_key;

    // Enqueue the Google Maps API
    wp_enqueue_script('googlemapsapi', $api_url . '/maps/api/js?v=3.exp&libraries=places' . $api_key, array('jquery'), null, true);

    // Enqueue the responsive maps javascripts
    wp_enqueue_script('resmap', plugins_url('includes/js/resmap.min.js', __FILE__), array('jquery', 'googlemapsapi'), '4.7', true);
}

/**
 * If text widgets do not support shortcodes already, add the neccessary filter to support shortcodes.
 */
if (has_filter('widget_text', 'do_shortcode') === false) {
    add_filter('widget_text', 'do_shortcode');
}

/**
 * On unistall, remove any saved plugin options and data from the database
*/
function resmap_uninstall() {
    delete_option('resmap_apikey');
    delete_option('resmap_shortcode');
}
register_uninstall_hook(__FILE__, 'resmap_uninstall');
