<?php
/*
 * Plugin's admin form
 */

// Retrive from $_POST the Google Maps API key; if it's set in the form, save it in the database
if (isset($_POST['resmap_apikey'])) {
    // Sanitize it
    $post_apikey = sanitize_text_field($_POST['resmap_apikey']);
    // And save it in the database
    if ($post_apikey != "") {
        update_option('resmap_apikey', $post_apikey);
    }
}

// Retrive from $_POST if we shoud save the shortcode in the database
$shortcode = '';
if (isset($_POST['save-shortcode'])) {
    // Get the shortcode from the form and clean it in a way to not distort tags
    $shortcode = wp_kses_post($_POST['resmap-shortcode']);
    // And save it in the database
    update_option('resmap_shortcode', $shortcode);
}

// The main function to show the plugin's admin screen 
function resmap_admin()
{
    // The value of the api key from database (we want to show it in the api key text field)
    $db_apikey = get_option('resmap_apikey');

    // The map shortcode previously saved in the database, if any
    $shortcode = get_option('resmap_shortcode', '');

?>

    <div class="wrap">

    <h2><?php echo esc_html__('Responsive Google Maps', 'res_map') ?></h2>

    <?php
    if (isset($_POST['save-shortcode'])) {
        _e('<div class="notice notice-success is-dismissible"><p>All settings were successfully saved.</p></div>');
    }
    ?>

    <br>
    <!-- Beginning of the Responsive Styled Gooogle Maps helper form -->
    <form method="POST" action="" id="resmap-form">

        <input type="hidden" id="resmap_admin" value="<?php echo esc_attr(plugins_url()); ?>">

        <script type="text/javascript">
            var pluginurl = "<?php echo plugins_url(); ?>";
            var shortcode = "<?php echo esc_js($shortcode); ?>";
        </script>

        <!-- The modal / dialog box -->
        <div id="resmap-dialog" class="hidden" style="max-width:800px;">
            <textarea name="loaded-shortcode" id="loaded-shortcode" rows="18" cols="80"></textarea>
            <br><br>
        </div>
            <!-- Table structure containing shortcode parameters -->
            <table id="resmap-table">

                <!-- Warning about Google Maps API key -->
                <tr>
                    <td align="left" valign="top">
                    </td>
                    <td>
                         <span class="highlight info">
                                <?php
                                $url = 'https://developers.google.com/maps/documentation/javascript/get-api-key';
                                echo sprintf(wp_kses(__('For maps created after June 22, 2016, Google requires the mandatory use of an API key, get one <a href="%s" target="_blank">HERE</a>', 'res_map'), array(  'a' => array( 'href' => array() ) )), esc_url($url));
                            ?>
                        </span>
                    </td>
                     <td rowspan="19" valign="top" valign="top" width="600px">
                        <div id="responsive_map" class="responsive-map" style="height:500px;width:600px;"></div><br>
                        <!-- Buttons -->
                        <a href="#" class="button button-primary button-resmap load-shortcode"><?php echo esc_html__('LOAD A SHORTCODE', 'res_map') ?></a>
                        <a href="javascript: resmap_updateMap(pluginurl);" class="button button-primary button-resmap"><?php echo esc_html__('RELOAD THE MAP', 'res_map') ?></a>
                        <input type="hidden" value="" id="save-shortcode" name="save-shortcode">
                        <input type="submit" class="button button-primary button-resmap" value="<?php echo esc_attr('SAVE SETTINGS', 'res_map'); ?>">
                        <a href="javascript: resmap_resetSettings(true);" class="button button-primary button-resmap"><?php echo esc_html__('RESET SETTINGS', 'res_map') ?></a>
                        <br><div class="preheader"><?php echo esc_html__('COPY-PASTE IN YOUR POST / PAGE / WIDGET THIS SHORTCODE:', 'res_map') ?></div>
                        <textarea name="resmap-shortcode" id="resmap-shortcode" rows="18" readonly="readonly" onclick="this.focus();this.select();">
                        </textarea>
                        <hr>
                    </td>
                </tr> 

                <!-- Google Maps API key -->
                <tr>
                    <td align="left" valign="top">
                        <span class="highlight">
                            <?php echo esc_html__('API key', 'res_map') ?>
                        </span>
                    </td>
                    <td>
                        <input type="text" size="43" name="resmap_apikey" id="resmap_apikey" value="<?php echo esc_attr($db_apikey); ?>" />
                        <input type="submit" class="button button-primary" value="<?php esc_attr_e('Save key and reload the map', 'res_map'); ?>" />
                    </td>
                </tr> 

                <!-- Address, the map and the shortcode -->
                <tr>
                    <td align="left" valign="top"><?php echo esc_html__('Address', 'res_map') ?></td>
                    <td valign="top">
                        <textarea name="address" id="address" rows="3" onblur="resmap_updateMap(pluginurl)">Yeronga QLD 4104, Australia</textarea><br>
                        <span class="info"><?php echo esc_html__('For multiple markers use: address1 | address2 | address3  OR lat1,long1 | lat2,long2 | lat3,long3', 'res_map') ?></span>
                    </td>
                </tr>

                <!-- Marker Description -->
                <tr>
                    <td align="left" valign="top"><?php echo esc_html__('Description', 'res_map') ?></td>
                    <td valign="top">
                        <textarea name="rsdescription" id="rsdescription" rows="3" onblur="resmap_updateMap(pluginurl)"><?php echo '&lt;img src="' . plugins_url() .'/responsive-maps-plugin/includes/img/company.png"&gt;';?> {br} Yeronga QLD 4104, Australia {br} Phone: 0040 752 235 756</textarea><br>
                        <span class="info"><?php echo esc_html__('For multiple markers use: description1 | description2 | description3 and {br} for a new line', 'res_map') ?></span>
                    </td>

                </tr>

                <!-- Directions text -->
                <tr>
                    <td align="left"><?php echo esc_html__('Directions text', 'res_map') ?></td>
                    <td>
                        <input type="text" size="28" name="directionstext" id="directionstext" value="(directions to our address)" onblur="resmap_updateMap(pluginurl)"  />
                        <span class="info"><?php echo esc_html__('Optional, the text to put as directions text in the popup.', 'res_map') ?> </span>
                    </td>
                </tr>  
                
                <!-- Marker icons -->
                <tr>
                    <td scope="row" align="left" valign="bottom"><?php echo esc_html__('Icon (predefined)', 'res_map') ?></td>
                    <td valign="bottom">
                        <label><input name="icon" type="radio" value="black" onclick="resmap_updateMap(pluginurl)" /> <img src="<?php echo plugins_url(); ?>/responsive-maps-plugin/includes/icons/black.png"> </label>
                        <label><input name="icon" type="radio" value="blue" onclick="resmap_updateMap(pluginurl)" checked /> <img src="<?php echo plugins_url(); ?>/responsive-maps-plugin/includes/icons/blue.png"> </label>
                        <label><input name="icon" type="radio" value="gray" onclick="resmap_updateMap(pluginurl)" /> <img src="<?php echo plugins_url(); ?>/responsive-maps-plugin/includes/icons/gray.png"> </label>
                        <label><input name="icon" type="radio" value="green" onclick="resmap_updateMap(pluginurl)" /> <img src="<?php echo plugins_url(); ?>/responsive-maps-plugin/includes/icons/green.png"> </label>
                        <label><input name="icon" type="radio" value="magenta" onclick="resmap_updateMap(pluginurl)" /> <img src="<?php echo plugins_url(); ?>/responsive-maps-plugin/includes/icons/magenta.png"> </label>
                        <label><input name="icon" type="radio" value="orange" onclick="resmap_updateMap(pluginurl)" /> <img src="<?php echo plugins_url(); ?>/responsive-maps-plugin/includes/icons/orange.png"> </label>
                        <label><input name="icon" type="radio" value="purple" onclick="resmap_updateMap(pluginurl)" /> <img src="<?php echo plugins_url(); ?>/responsive-maps-plugin/includes/icons/purple.png"> </label>
                        <label><input name="icon" type="radio" value="red" onclick="resmap_updateMap(pluginurl)" /> <img src="<?php echo plugins_url(); ?>/responsive-maps-plugin/includes/icons/red.png"> </label>
                        <label><input name="icon" type="radio" value="white" onclick="resmap_updateMap(pluginurl)" /> <img src="<?php echo plugins_url(); ?>/responsive-maps-plugin/includes/icons/white.png"> </label>
                        <label><input name="icon" type="radio" value="yellow" onclick="resmap_updateMap(pluginurl)" /> <img src="<?php echo plugins_url(); ?>/responsive-maps-plugin/includes/icons/yellow.png"> </label>
                    </td>
                </tr>
                
                <!-- Marker icon url -->
                <tr>
                    <tr>
                    <td scope="row" align="left" valign="top">
                        <?php echo esc_html__('or a http link to', 'res_map') ?>
                        <br>
                        <?php echo esc_html__('a custom icon:', 'res_map') ?>
                    </td>
                    <td valign="top">
                        <label><input name="icon" id="icon" type="radio" value="custom" onclick="resmap_updateMap(pluginurl)" /></label>
                        <textarea name="iconurl" id="iconurl" rows="2" onblur="resmap_updateMap(pluginurl)"><?php echo plugins_url(); ?>/responsive-maps-plugin/includes/icons/pin.png</textarea>
                        <br>
                        <span class="info"><?php echo esc_html__('For multiple markers use: https://website/icon1.png | https://website/icon2.png', 'res_map') ?></span>
                    </td>
                </tr>

                <!-- Marker icon size -->
                <tr>
                    <td align="left"><?php echo esc_html__('Icon size', 'res_map') ?></td>
                    <td>
                        <input type="text" size="11" name="iconsize" id="iconsize" value="" onblur="resmap_updateMap(pluginurl)" />
                        <span class="info"><?php echo esc_html__('For example: 26, 35 (means 26px width, 35px height; if empty, means automatic size)', 'res_map') ?> </span>
                    </td>
                </tr>  

                <!-- Style -->
                <tr>
                    <td align="left"><strong><?php echo esc_html__('Map style', 'res_map') ?></strong></td>
                    <td>
                        <select name='style' id="style" onchange="resmap_showHideColorPicker();resmap_updateMap(pluginurl)">
                            <option value='0'><?php echo esc_html__('select color', 'res_map') ?></option>
                            <option value='1'>style 1</option>
                            <option value='2' selected>style 2</option>
                            <option value='3'>style 3</option>
                            <option value='4'>style 4</option>
                            <option value='5'>style 5</option>
                            <option value='6'>style 6</option>
                            <option value='7'>style 7</option>
                            <option value='8'>style 8</option>
                            <option value='9'>style 9</option>
                            <option value='10'>style 10</option>
                            <option value='11'>style 11</option>
                            <option value='12'>style 12</option>
                            <option value='13'>style 13</option>
                            <option value='14'>style 14</option>
                            <option value='15'>style 15</option>
                            <option value='16'>style 16</option>
                            <option value='17'>style 17</option>
                            <option value='18'>style 18</option>
                            <option value='19'>style 19</option>
                            <option value='20'>style 20</option>
                            <option value='21'>style 21</option>
                            <option value='22'>style 22</option>
                            <option value='23'>style 23</option>
                            <option value='24'>style 24</option>
                            <option value='25'>style 25</option>
                            <option value='26'>style 26</option>
                            <option value='27'>style 27</option>
                            <option value='28'>style 28</option>
                            <option value='29'>style 29</option>
                            <option value='30'>style 30</option>
                            <option value='31'>style 31</option>
                            <option value='32'>style 32</option>
                            <option value='33'>style 33</option>
                            <option value='34'>style 34</option>
                            <option value='35'>style 35</option>
                            <option value='36'>style 36</option>
                            <option value='37'>style 37</option>
                            <option value='38'>style 38</option>
                            <option value='39'>style 39</option>
                            <option value='40'>style 40</option>
                            <option value='41'>style 41</option>
                            <option value='42'>style 42</option>
                            <option value='43'>style 43</option>
                            <option value='44'>style 44</option>
                            <option value='45'>style 45</option>
                            <option value='46'>style 46</option>
                            <option value='47'>style 47</option>
                            <option value='48'>style 48</option>
                            <option value='49'>style 49</option>
                            <option value='50'>style 50</option>
                        </select>
                        <!-- Color picker -->
                        <input type="text" id="mapcolor" name="mapcolor" value="#2EA2CC" data-text="<?php echo esc_html__('select a color...', 'res_map') ?>"/>
                        <span class="info" id="colorinfo"><?php echo esc_html__('Choose from 50 custom styles or a specific color.', 'res_map') ?></span>
                        <input type="hidden" name ="newcolor" id="newcolor" value="#2EA2CC"/>
                    </td>
                </tr>
                
                <!-- Controls -->
                <tr>
                    <td align="left"><?php echo esc_html__('Controls', 'res_map') ?></td>
                    <td>
                        <?php echo esc_html__('Scale control', 'res_map') ?>
                        <select name='scalecontrol' id='scalecontrol' onchange="resmap_updateMap(pluginurl)">
                            <option value='no' selected><?php echo esc_html__('no', 'res_map') ?></option>
                            <option value='yes'><?php echo esc_html__('yes', 'res_map') ?></option>
                        </select>
                        <?php echo esc_html__('Type control', 'res_map') ?>
                        <select name='typecontrol' id='typecontrol' onchange="resmap_updateMap(pluginurl)">
                            <option value='no' selected><?php echo esc_html__('no', 'res_map') ?></option>
                            <option value='yes'><?php echo esc_html__('yes', 'res_map') ?></option>
                        </select>
                        <?php echo esc_html__('Street control', 'res_map') ?>
                        <select name='streetcontrol' id='streetcontrol' onchange="resmap_updateMap(pluginurl)">
                            <option value='no' selected><?php echo esc_html__('no', 'res_map') ?></option>
                            <option value='yes'><?php echo esc_html__('yes', 'res_map') ?></option>
                        </select>
                        <?php echo esc_html__('Locate me', 'res_map') ?>
                        <select name='locateme' id='locateme' onchange="resmap_updateMap(pluginurl)">
                            <option value='no' selected><?php echo esc_html__('no', 'res_map') ?></option>
                            <option value='yes'><?php echo esc_html__('yes', 'res_map') ?></option>
                        </select>
                    </td>
                </tr>

                <!-- Second line with map controls -->
                <tr>
                    <td align="left"></td>
                    <td>
                        <?php echo esc_html__('Zoom level', 'res_map') ?> &nbsp;
                        <select name="zoom" id="zoom" onchange="resmap_updateMap(pluginurl)">
                            <option value='1'>1</option>
                            <option value='2'>2</option>
                            <option value='3'>3</option>
                            <option value='4'>4</option>
                            <option value='5'>5</option>
                            <option value='6'>6</option>
                            <option value='7'>7</option>
                            <option value='8'>8</option>
                            <option value='9'>9</option>
                            <option value='10'>10</option>
                            <option value='11'>11</option>
                            <option value='12'>12</option>
                            <option value='13' selected>13</option>
                            <option value='14'>14</option>
                            <option value='15'>15</option>
                            <option value='16'>16</option>
                            <option value='17'>17</option>
                            <option value='18'>18</option>
                            <option value='19'>19</option>
                        </select>
                        <?php echo esc_html__('Zoom control', 'res_map') ?>
                        <select name='zoomcontrol' id='zoomcontrol' onchange="resmap_updateMap(pluginurl)">
                            <option value='no' selected><?php echo esc_html__('no', 'res_map') ?></option>
                            <option value='yes'><?php echo esc_html__('yes', 'res_map') ?></option>
                        </select>
                        <?php echo esc_html__('Draggable map', 'res_map') ?>
                        <select name='draggable' id='draggable' onchange="resmap_updateMap(pluginurl)">
                            <option value='no'><?php echo esc_html__('no', 'res_map') ?></option>
                            <option value='yes' selected><?php echo esc_html__('yes', 'res_map') ?></option>
                        </select>
                        <?php echo esc_html__('Scroll wheel', 'res_map') ?>
                        <select name='scrollwheel' id='scrollwheel' onchange="resmap_updateMap(pluginurl)">
                            <option value='no' selected><?php echo esc_html__('no', 'res_map') ?></option>
                            <option value='yes'><?php echo esc_html__('yes', 'res_map') ?></option>
                        </select>
                        </td>
                </tr>

                <!-- Third line with map controls -->
                <tr>
                    <td align="left"></td>
                    <td>
                        <?php echo esc_html__('Search box', 'res_map') ?> &nbsp;
                        <select name="searchbox" id="searchbox" onchange="resmap_updateMap(pluginurl)">
                            <option value='no' selected><?php echo esc_html__('no', 'res_map') ?></option>
                            <option value='yes'><?php echo esc_html__('yes', 'res_map') ?></option>
                        </select>
                        <?php echo esc_html__('Clustering', 'res_map') ?>
                        <select name='clustering' id='clustering' onchange="resmap_updateMap(pluginurl)">
                            <option value='no' selected><?php echo esc_html__('no', 'res_map') ?></option>
                            <option value='yes'><?php echo esc_html__('yes', 'res_map') ?></option>
                        </select>
                        <?php echo esc_html__('Logging', 'res_map') ?>
                        <select name='logging' id='logging' onchange="resmap_updateMap(pluginurl)">
                            <option value='no' selected><?php echo esc_html__('no', 'res_map') ?></option>
                            <option value='yes'><?php echo esc_html__('yes', 'res_map') ?></option>
                        </select>
                        <?php echo esc_html__('Points of interest', 'res_map') ?>
                        <select name='poi' id='poi' onchange="resmap_updateMap(pluginurl)">
                            <option value='no'><?php echo esc_html__('no', 'res_map') ?></option>
                            <option value='yes' selected><?php echo esc_html__('yes', 'res_map') ?></option>
                        </select>
                        </td>
                </tr>
                <!-- Fourth line with map controls -->
                <tr>
                    <td align="left"></td>
                    <td>
                        <?php echo esc_html__('Fullscreen', 'res_map') ?> &nbsp;
                        <select name="fullscreen" id="fullscreen" onchange="resmap_updateMap(pluginurl)">
                            <option value='no' selected><?php echo esc_html__('no', 'res_map') ?></option>
                            <option value='yes'><?php echo esc_html__('yes', 'res_map') ?></option>
                        </select>
                        <?php echo esc_html__('Popup', 'res_map') ?> &nbsp;
                        <select name='popup' id="popup" onchange="resmap_updateMap(pluginurl)">
                            <option value='no' selected><?php echo esc_html__('no', 'res_map') ?></option>
                            <option value='yes'><?php echo esc_html__('yes', 'res_map') ?></option>
                        </select>
                    </td>
                </tr>
                
                <!-- Width -->
                <tr>
                    <td align="left"><?php echo esc_html__('Map width', 'res_map') ?></td>
                    <td>
                        <input type="text" size="6" name="width" id="width" value="100" onblur="resmap_updateMap(pluginurl)"/>
                        <select name='widthm' id='widthm' onchange="resmap_updateMap(pluginurl)">
                            <option value='%' selected>%</option>
                            <option value='px'>px</option>
                        </select>
                        <span class="info"><?php echo esc_html__('100% for a responsive map (the map preview has fixed width and height).', 'res_map') ?></span>
                    </td>
                </tr>

                <!-- Height -->
                <tr>
                    <td align="left"><?php echo esc_html__('Map height', 'res_map') ?></td>
                    <td>
                        <input type="text" size="6" name="height" id="height" value="500" onblur="resmap_updateMap(pluginurl)"/>
                        <select name='heightm' id='heightm' onchange="resmap_updateMap(pluginurl)">
                            <option value='%'>%</option>
                            <option value='px' selected>px</option>
                        </select>
                        <span class="info"><?php echo esc_html__('In px or % (the map preview has fixed width and height).', 'res_map') ?></span>
                    </td>
                </tr>
                
                <!-- Map Type -->
                <tr>
                    <td align="left"><?php echo esc_html__('Map type', 'res_map') ?></td>
                    <td>
                        <select name='maptype' id="maptype" onchange="resmap_updateMap(pluginurl)">
                            <option value='roadmap' selected><?php echo esc_html__('roadmap') ?></option>
                            <option value='satellite'><?php echo esc_html__('satellite') ?></option>
                            <option value='terrain'><?php echo esc_html__('terrain') ?></option>
                            <option value='hybrid'><?php echo esc_html__('hybrid') ?></option>
                        </select>
                        <span class="info"><?php echo esc_html__('Possible values: roadmap, satellite, terrain or hybrid', 'res_map') ?></span>
                    </td>
                </tr>

                <!-- Map refresh (when window is scaled) -->
                <tr>
                    <td align="left"><?php echo esc_html__('Refresh', 'res_map') ?></td>
                    <td>
                        <select name='refresh' id='refresh' onchange="resmap_updateMap(pluginurl)">
                            <option value='no'><?php echo esc_html__('no', 'res_map') ?></option>
                            <option value='yes' selected><?php echo esc_html__('yes', 'res_map') ?></option>
                        </select>
                        <span class="info"> <?php echo esc_html__('"yes" if the map should be refreshed (re-centered) when the window is scaled. ', 'res_map') ?></span>
                    </td>
                </tr>

                 <!-- Map center -->
                <tr>
                    <td align="left"><?php echo esc_html__('Center to', 'res_map') ?></td>
                    <td>
                        <input type="text" size="28" name="center" id="center" value="" onblur="resmap_updateMap(pluginurl);"/>
                        <span class="info"><?php echo esc_html__('Optional: latitude, longitude i.e. 38.980288, 22.145996', 'res_map') ?></span>
                    </td>
                </tr>
                
            </table>
        </form>
    </div>
<?php
}
?>