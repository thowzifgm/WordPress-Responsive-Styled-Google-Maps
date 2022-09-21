/**
 * Plugin's jquery functions and included jQuery libraries
 */


/**
 * Open a certain marker (where openMarker(1, 5) mean: open the 5th marker from the 1st map displayed) 
 * @param e the index of the map
 * @param t the index of the marker to be open in the map
 */
function openMarker(e, t) {
    jQuery(".responsive-map").each(function(n) {
        if (jQuery(this).data("gmap") && e == n + 1) {
            google.maps.event.trigger(jQuery(this).gMapResp("getMarker", t), "click")
        }
    })
}


/**
 * Adds a "your location" button
 * @param map the map in which to create the "your location" button
 */
function resmap_addLocatemeButton(map) {

    var controlDiv = document.createElement('div');
    controlDiv.id = 'locatemediv';
    
    var firstChild = document.createElement('button');
    firstChild.id = 'locatemeFirstChild';
    firstChild.title = 'Your Location';
    firstChild.type = "button";
    controlDiv.appendChild(firstChild);
    
    var secondChild = document.createElement('div');
    secondChild.id = 'locatemeSecondChild';
    firstChild.appendChild(secondChild);
    
    var thirdChild = document.createElement('div');
    thirdChild.id = 'locatemeThirdChild';
    secondChild.appendChild(thirdChild);
    
    firstChild.addEventListener('click', function() {
    	
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                map.setCenter(latlng);
                
                var locatemeIcon = {
                		path: 'M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0',
                        strokeColor: '#BBBBBB',
                        strokeWeight: 6,
                        fillColor: '#666666',
                        fillOpacity: 0.8,
                        scale: 0.7
            	  };

                var marker = new google.maps.Marker({
                    position: latlng,
                    icon: locatemeIcon,
                    map: map,
                    title: ''
                  });
            });
        }
    });
    
    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
}


/**
 * Create address search control 
 * @param map the map in which to create the search box
 */
function resmap_createSearchBox(map) {
    var control = document.createElement('div');
    var input = document.createElement('input');
    control.appendChild(input);
    control.setAttribute('id', 'locationDiv');
    input.setAttribute('id', 'locationInput');
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(control);

    var ac = new google.maps.places.Autocomplete(input, { types: ['geocode'] });

    google.maps.event.addListener(ac, 'place_changed', function() {
        var place = ac.getPlace();
        if (place && place.geometry && place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else if (place.geometry) {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }
      });

    input.onkeyup = resmap_submitGeocode(input);
}

/**
 * Geocodes the address entered in the input field 
 * @param input the search box 
 */
function resmap_submitGeocode(input) {
    return function(e) {
        var enterPressed;

        if (window.event) {
            enterPressed = (window.event.which == 13 || window.event.keyCode == 13);
        } else {
            enterPressed = (e.which == 13);
        }

        if (enterPressed && typeof geocoder !== "undefined") {
            geocoder.geocode({
                address: input.value
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    map.fitBounds(results[0].geometry.viewport);
                } 
            });
        }
    }
}
 
/**
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="https://github.com/googlemaps/js-marker-clusterer"
 * >v2 MarkerClusterer</a>.
 */

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function(){var d=null;function e(a){return function(b){this[a]=b}}function h(a){return function(){return this[a]}}var j;
function k(a,b,c){this.extend(k,google.maps.OverlayView);this.c=a;this.a=[];this.f=[];this.ca=[53,56,66,78,90];this.j=[];this.A=!1;c=c||{};this.g=c.gridSize||60;this.l=c.minimumClusterSize||2;this.J=c.maxZoom||d;this.j=c.styles||[];this.X=c.imagePath||this.Q;this.W=c.imageExtension||this.P;this.O=!0;if(c.zoomOnClick!=void 0)this.O=c.zoomOnClick;this.r=!1;if(c.averageCenter!=void 0)this.r=c.averageCenter;l(this);this.setMap(a);this.K=this.c.getZoom();var f=this;google.maps.event.addListener(this.c,
"zoom_changed",function(){var a=f.c.getZoom();if(f.K!=a)f.K=a,f.m()});google.maps.event.addListener(this.c,"idle",function(){f.i()});b&&b.length&&this.C(b,!1)}j=k.prototype;j.Q="https://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";j.P="png";j.extend=function(a,b){return function(a){for(var b in a.prototype)this.prototype[b]=a.prototype[b];return this}.apply(a,[b])};j.onAdd=function(){if(!this.A)this.A=!0,n(this)};j.draw=function(){};
function l(a){if(!a.j.length)for(var b=0,c;c=a.ca[b];b++)a.j.push({url:a.X+(b+1)+"."+a.W,height:c,width:c})}j.S=function(){for(var a=this.o(),b=new google.maps.LatLngBounds,c=0,f;f=a[c];c++)b.extend(f.getPosition());this.c.fitBounds(b)};j.z=h("j");j.o=h("a");j.V=function(){return this.a.length};j.ba=e("J");j.I=h("J");j.G=function(a,b){for(var c=0,f=a.length,g=f;g!==0;)g=parseInt(g/10,10),c++;c=Math.min(c,b);return{text:f,index:c}};j.$=e("G");j.H=h("G");
j.C=function(a,b){for(var c=0,f;f=a[c];c++)q(this,f);b||this.i()};function q(a,b){b.s=!1;b.draggable&&google.maps.event.addListener(b,"dragend",function(){b.s=!1;a.L()});a.a.push(b)}j.q=function(a,b){q(this,a);b||this.i()};function r(a,b){var c=-1;if(a.a.indexOf)c=a.a.indexOf(b);else for(var f=0,g;g=a.a[f];f++)if(g==b){c=f;break}if(c==-1)return!1;b.setMap(d);a.a.splice(c,1);return!0}j.Y=function(a,b){var c=r(this,a);return!b&&c?(this.m(),this.i(),!0):!1};
j.Z=function(a,b){for(var c=!1,f=0,g;g=a[f];f++)g=r(this,g),c=c||g;if(!b&&c)return this.m(),this.i(),!0};j.U=function(){return this.f.length};j.getMap=h("c");j.setMap=e("c");j.w=h("g");j.aa=e("g");
j.v=function(a){var b=this.getProjection(),c=new google.maps.LatLng(a.getNorthEast().lat(),a.getNorthEast().lng()),f=new google.maps.LatLng(a.getSouthWest().lat(),a.getSouthWest().lng()),c=b.fromLatLngToDivPixel(c);c.x+=this.g;c.y-=this.g;f=b.fromLatLngToDivPixel(f);f.x-=this.g;f.y+=this.g;c=b.fromDivPixelToLatLng(c);b=b.fromDivPixelToLatLng(f);a.extend(c);a.extend(b);return a};j.R=function(){this.m(!0);this.a=[]};
j.m=function(a){for(var b=0,c;c=this.f[b];b++)c.remove();for(b=0;c=this.a[b];b++)c.s=!1,a&&c.setMap(d);this.f=[]};j.L=function(){var a=this.f.slice();this.f.length=0;this.m();this.i();window.setTimeout(function(){for(var b=0,c;c=a[b];b++)c.remove()},0)};j.i=function(){n(this)};
function n(a){if(a.A)for(var b=a.v(new google.maps.LatLngBounds(a.c.getBounds().getSouthWest(),a.c.getBounds().getNorthEast())),c=0,f;f=a.a[c];c++)if(!f.s&&b.contains(f.getPosition())){for(var g=a,u=4E4,o=d,v=0,m=void 0;m=g.f[v];v++){var i=m.getCenter();if(i){var p=f.getPosition();if(!i||!p)i=0;else var w=(p.lat()-i.lat())*Math.PI/180,x=(p.lng()-i.lng())*Math.PI/180,i=Math.sin(w/2)*Math.sin(w/2)+Math.cos(i.lat()*Math.PI/180)*Math.cos(p.lat()*Math.PI/180)*Math.sin(x/2)*Math.sin(x/2),i=6371*2*Math.atan2(Math.sqrt(i),
Math.sqrt(1-i));i<u&&(u=i,o=m)}}o&&o.F.contains(f.getPosition())?o.q(f):(m=new s(g),m.q(f),g.f.push(m))}}function s(a){this.k=a;this.c=a.getMap();this.g=a.w();this.l=a.l;this.r=a.r;this.d=d;this.a=[];this.F=d;this.n=new t(this,a.z(),a.w())}j=s.prototype;
j.q=function(a){var b;a:if(this.a.indexOf)b=this.a.indexOf(a)!=-1;else{b=0;for(var c;c=this.a[b];b++)if(c==a){b=!0;break a}b=!1}if(b)return!1;if(this.d){if(this.r)c=this.a.length+1,b=(this.d.lat()*(c-1)+a.getPosition().lat())/c,c=(this.d.lng()*(c-1)+a.getPosition().lng())/c,this.d=new google.maps.LatLng(b,c),y(this)}else this.d=a.getPosition(),y(this);a.s=!0;this.a.push(a);b=this.a.length;b<this.l&&a.getMap()!=this.c&&a.setMap(this.c);if(b==this.l)for(c=0;c<b;c++)this.a[c].setMap(d);b>=this.l&&a.setMap(d);
a=this.c.getZoom();if((b=this.k.I())&&a>b)for(a=0;b=this.a[a];a++)b.setMap(this.c);else if(this.a.length<this.l)z(this.n);else{b=this.k.H()(this.a,this.k.z().length);this.n.setCenter(this.d);a=this.n;a.B=b;a.ga=b.text;a.ea=b.index;if(a.b)a.b.innerHTML=b.text;b=Math.max(0,a.B.index-1);b=Math.min(a.j.length-1,b);b=a.j[b];a.da=b.url;a.h=b.height;a.p=b.width;a.M=b.textColor;a.e=b.anchor;a.N=b.textSize;a.D=b.backgroundPosition;this.n.show()}return!0};
j.getBounds=function(){for(var a=new google.maps.LatLngBounds(this.d,this.d),b=this.o(),c=0,f;f=b[c];c++)a.extend(f.getPosition());return a};j.remove=function(){this.n.remove();this.a.length=0;delete this.a};j.T=function(){return this.a.length};j.o=h("a");j.getCenter=h("d");function y(a){a.F=a.k.v(new google.maps.LatLngBounds(a.d,a.d))}j.getMap=h("c");
function t(a,b,c){a.k.extend(t,google.maps.OverlayView);this.j=b;this.fa=c||0;this.u=a;this.d=d;this.c=a.getMap();this.B=this.b=d;this.t=!1;this.setMap(this.c)}j=t.prototype;
j.onAdd=function(){this.b=document.createElement("DIV");if(this.t)this.b.style.cssText=A(this,B(this,this.d)),this.b.innerHTML=this.B.text;this.getPanes().overlayMouseTarget.appendChild(this.b);var a=this;google.maps.event.addDomListener(this.b,"click",function(){var b=a.u.k;google.maps.event.trigger(b,"clusterclick",a.u);b.O&&a.c.fitBounds(a.u.getBounds())})};function B(a,b){var c=a.getProjection().fromLatLngToDivPixel(b);c.x-=parseInt(a.p/2,10);c.y-=parseInt(a.h/2,10);return c}
j.draw=function(){if(this.t){var a=B(this,this.d);this.b.style.top=a.y+"px";this.b.style.left=a.x+"px"}};function z(a){if(a.b)a.b.style.display="none";a.t=!1}j.show=function(){if(this.b)this.b.style.cssText=A(this,B(this,this.d)),this.b.style.display="";this.t=!0};j.remove=function(){this.setMap(d)};j.onRemove=function(){if(this.b&&this.b.parentNode)z(this),this.b.parentNode.removeChild(this.b),this.b=d};j.setCenter=e("d");
function A(a,b){var c=[];c.push("background-image:url("+a.da+");");c.push("background-position:"+(a.D?a.D:"0 0")+";");typeof a.e==="object"?(typeof a.e[0]==="number"&&a.e[0]>0&&a.e[0]<a.h?c.push("height:"+(a.h-a.e[0])+"px; padding-top:"+a.e[0]+"px;"):c.push("height:"+a.h+"px; line-height:"+a.h+"px;"),typeof a.e[1]==="number"&&a.e[1]>0&&a.e[1]<a.p?c.push("width:"+(a.p-a.e[1])+"px; padding-left:"+a.e[1]+"px;"):c.push("width:"+a.p+"px; text-align:center;")):c.push("height:"+a.h+"px; line-height:"+a.h+
"px; width:"+a.p+"px; text-align:center;");c.push("cursor:pointer; top:"+b.y+"px; left:"+b.x+"px; color:"+(a.M?a.M:"black")+"; position:absolute; font-size:"+(a.N?a.N:11)+"px; font-family:Arial,sans-serif; font-weight:bold");return c.join("")}window.MarkerClusterer=k;k.prototype.addMarker=k.prototype.q;k.prototype.addMarkers=k.prototype.C;k.prototype.clearMarkers=k.prototype.R;k.prototype.fitMapToMarkers=k.prototype.S;k.prototype.getCalculator=k.prototype.H;k.prototype.getGridSize=k.prototype.w;
k.prototype.getExtendedBounds=k.prototype.v;k.prototype.getMap=k.prototype.getMap;k.prototype.getMarkers=k.prototype.o;k.prototype.getMaxZoom=k.prototype.I;k.prototype.getStyles=k.prototype.z;k.prototype.getTotalClusters=k.prototype.U;k.prototype.getTotalMarkers=k.prototype.V;k.prototype.redraw=k.prototype.i;k.prototype.removeMarker=k.prototype.Y;k.prototype.removeMarkers=k.prototype.Z;k.prototype.resetViewport=k.prototype.m;k.prototype.repaint=k.prototype.L;k.prototype.setCalculator=k.prototype.$;
k.prototype.setGridSize=k.prototype.aa;k.prototype.setMaxZoom=k.prototype.ba;k.prototype.onAdd=k.prototype.onAdd;k.prototype.draw=k.prototype.draw;s.prototype.getCenter=s.prototype.getCenter;s.prototype.getSize=s.prototype.T;s.prototype.getMarkers=s.prototype.o;t.prototype.onAdd=t.prototype.onAdd;t.prototype.draw=t.prototype.draw;t.prototype.onRemove=t.prototype.onRemove;
})();

/**
 * jQuery gMap v3
 *
 * @url         http://www.smashinglabs.pl/gmap
 * @author      Sebastian Poreba <sebastian.poreba@gmail.com>
 * @fixes       hevada <contact@hevada.com>
 * @version     3.3.3
 * @date        27.12.2012
 */
(function(e) {
    var t = function() {
        this.markers = [];
        this.mainMarker = !1;
        this.icon = "https://www.google.com/mapfiles/marker.png"
    };
    t.prototype.dist = function(e) {
        return Math.sqrt(Math.pow(this.markers[0].latitude - e.latitude, 2) + Math.pow(this.markers[0].longitude - e.longitude, 2))
    };
    t.prototype.setIcon = function(e) {
        this.icon = e
    };
    t.prototype.addMarker = function(e) {
        this.markers[this.markers.length] = e
    };
    t.prototype.getMarker = function() {
        if (this.mainmarker) return this.mainmarker;
        var e, t;
        1 < this.markers.length ? (e = new n.MarkerImage("https://thydzik.com/thydzikGoogleMap/markerlink.php?text=" + this.markers.length + "&color=EF9D3F"), t = "cluster of " + this.markers.length + " markers") : (e = new n.MarkerImage(this.icon), t = this.markers[0].title);
        return this.mainmarker = new n.Marker({
            position: new n.LatLng(this.markers[0].latitude, this.markers[0].longitude),
            icon: e,
            title: t,
            map: null
        })
    };
    var n = google.maps,
        r = new n.Geocoder,
        i = 0,
        s = 0,
        o = {},
        o = {
            init: function(t) {
                var r, i = e.extend({}, e.fn.gMapResp.defaults, t);
                for (r in e.fn.gMapResp.defaults.icon) i.icon[r] || (i.icon[r] = e.fn.gMapResp.defaults.icon[r]);
                return this.each(function() {
                    var t = e(this);
                        r = o._getMapCenter.apply(t, [i]);
                    "fit" == i.zoom && (i.zoomFit = !0, i.zoom = o._autoZoom.apply(t, [i]));
                    var s = {
                        zoom: i.zoom,
                        center: r,
                        mapTypeControl: i.mapTypeControl,
                        mapTypeControlOptions: {},
                        zoomControl: i.zoomControl,
                        draggable: i.draggable,
                        zoomControlOptions: {},
                        scaleControl: i.scaleControl,
                        scaleControlOptions: {},
                        streetViewControl: i.streetViewControl,
                        streetViewControlOptions: {},
                        fullscreenControl: i.fullscreenControl,
                        mapTypeId: i.maptype,
                        scrollwheel: i.scrollwheel,
                        maxZoom: i.maxZoom,
                        minZoom: i.minZoom
                    };
                    i.controlsPositions.mapType && (s.mapTypeControlOptions.position = i.controlsPositions.mapType);
                    i.controlsPositions.zoom && (s.zoomControlOptions.position = i.controlsPositions.zoom);
                    i.controlsPositions.scale && (s.scaleControlOptions.position = i.controlsPositions.scale);
                    i.controlsPositions.streetView && (s.streetViewControlOptions.position = i.controlsPositions.streetView);
                    i.styles && (s.styles = i.styles);
                    s.mapTypeControlOptions.style = i.controlsStyle.mapType;
                    s.zoomControlOptions.style = i.controlsStyle.zoom;
                    s = new n.Map(this, s);
                    i.log && console.log("map center is:");
                    i.log && console.log(r);
                    t.data("$gmap", s);
                    t.data("gmap", {
                        opts: i,
                        gmap: s,
                        markers: [],
                        markerKeys: {},
                        infoWindow: null,
                        clusters: []
                    });
                    if (0 !== i.controls.length)
                        for (r = 0; r < i.controls.length; r += 1) s.controls[i.controls[r].pos].push(i.controls[r].div);
                    i.clustering.enabled ? (r = t.data("gmap"), r.markers = i.markers, o._renderCluster.apply(t, []), n.event.addListener(s, "bounds_changed", function() {
                        o._renderCluster.apply(t, [])
                    })) : 0 !== i.markers.length && o.addMarkers.apply(t, [i.markers]);
                    o._onComplete.apply(t, [])
                })
            },
            _delayedMode: false,
            _onComplete: function() {
                var data = this.data('gmap'),
                that = this;

                if (i !== 0) {
                    window.setTimeout(function() {
                        o._onComplete.apply(that, []); 
                    }, 100);
                    return;
                }
                if (o._delayedMode) {
                    var center = o._getMapCenter.apply(this, [data.opts, true]);
                    if (center !== undefined && [center] != [0, 0]) {
                        o._setMapCenter.apply(this, [center]);
                    }
                    if (data.opts.zoomFit) {
                        var zoom = o._autoZoom.apply(this, [data.opts, true]);
                        data.gmap.setZoom(zoom);
                    }
                }
                data.opts.onComplete();
            },
            _setMapCenter: function(center) {
                var data = this.data('gmap');
                if (data && data.opts.log) {
                    console.log('delayed setMapCenter called'); 
                }
                if (data && data.gmap !== undefined && i == 0) {
                    if (center !== undefined && [center] != [0, 0])
                        data.gmap.setCenter(center);
                } else {
                    var that = this;
                    window.setTimeout(function() {
                        if (center !== undefined && [center] != [0, 0])
                            o._setMapCenter.apply(that, [center]); 
                    }, 100);
                }
            },
            _boundaries: null,
            _getBoundaries: function(e) {
                var t = e.markers,
                    n, r = 1e3,
                    i = -1e3,
                    s = 1e3,
                    u = -1e3;
                if (t) {
                    for (n = 0; n < t.length; n += 1) t[n].latitude && t[n].longitude && (r > t[n].latitude && (r = t[n].latitude), i < t[n].longitude && (i = t[n].longitude), s > t[n].longitude && (s = t[n].longitude), u < t[n].latitude && (u = t[n].latitude), e.log && console.log(t[n].latitude, t[n].longitude, r, i, s, u));
                    o._boundaries = {
                        N: r,
                        E: i,
                        W: s,
                        S: u
                    }
                } - 1e3 == r && (o._boundaries = {
                    N: 0,
                    E: 0,
                    W: 0,
                    S: 0
                });
                return o._boundaries
            },
            _getBoundariesFromMarkers: function() {
                var e = this.data("gmap").markers,
                    t, n = 1e3,
                    r = -1e3,
                    i = 1e3,
                    s = -1e3;
                if (e) {
                    for (t = 0; t < e.length; t += 1) n > e[t].getPosition().lat() && (n = e[t].getPosition().lat()), r < e[t].getPosition().lng() && (r = e[t].getPosition().lng()), i > e[t].getPosition().lng() && (i = e[t].getPosition().lng()), s < e[t].getPosition().lat() && (s = e[t].getPosition().lat());
                    o._boundaries = {
                        N: n,
                        E: r,
                        W: i,
                        S: s
                    }
                } - 1e3 == n && (o._boundaries = {
                    N: 0,
                    E: 0,
                    W: 0,
                    S: 0
                });
                return o._boundaries
            },
            _getMapCenter: function(opts, fromMarkers) {

                // Create new object to geocode addresses
                var center,
                        that = this, // 'that' scope fix in geocoding
                        i,
                        selectedToCenter,
                        most; //hoisting

                if (opts.markers.length && (opts.latitude == 'fit' || opts.longitude == 'fit')) {
                    if (fromMarkers) {
                      opts.markers = o._convertMarkers(data.markers);
                    }

                    most = o._getBoundaries(opts);
                    center = new n.LatLng((most.N + most.S) / 2, (most.E + most.W) / 2);
                    if (opts.log) {
                      console.log(fromMarkers, most, center);
                    }
                    return center;
                  }

                  center = new n.LatLng(0, 0);

                  if (opts.latitude && opts.longitude) {
                            // lat & lng available, return
                            center = new n.LatLng(opts.latitude, opts.longitude);
                            return center;
                  } else {

                            // Check for a marker to center on (if no coordinates given)
                            if (opts.markers.length > 0) {
                                selectedToCenter = null;

                                for (i = 0; i < opts.markers.length; i += 1) {
                                    if (opts.markers[i].setCenter) {
                                        selectedToCenter = opts.markers[i];
                                        break;
                                    }
                                }

                                if (selectedToCenter === null) {
                                    for (i = 0; i < opts.markers.length; i += 1) {
                                        if (opts.markers[i].latitude && opts.markers[i].longitude) {
                                            selectedToCenter = opts.markers[i];
                                            break;
                                        } else if (opts.markers[i].address) {
                                            selectedToCenter = opts.markers[i];
                                            break;
                                        }
                                    }
                                }

                                // failed to find any reasonable marker (it's quite impossible BTW)
                                if (selectedToCenter === null) {
                                        return center;
                                }

                                // check if the marker has latitude, longitude
                                if (selectedToCenter.latitude && selectedToCenter.longitude) {
                                        return new n.LatLng(selectedToCenter.latitude, selectedToCenter.longitude);
                                }

                                // check if the marker has an address
                                if (selectedToCenter.address) {
                                            // Get the coordinates for given marker address and center
                                            r.geocode(
                                                {address: selectedToCenter.address},
                                                function(result, status) {
                                                        if (status === google.maps.GeocoderStatus.OK) {
                                                            o._setMapCenter.apply(that, [result[0].geometry.location]);
                                                        } else {
                                                            if (opts.log) {console.log('Geocode was not successful for the following reason: ' + status); }
                                                        }
                                                }
                                            );
                                }
                        }
                    }
                //return center;
            },
            _renderCluster: function() {
                var e = this.data("gmap"),
                    n = e.markers,
                    r = e.clusters,
                    i = e.opts,
                    s;
                for (s = 0; s < r.length; s += 1) r[s].getMarker().setMap(null);
                r.length = 0;
                if (s = e.gmap.getBounds()) {
                    var u = s.getNorthEast(),
                        a = s.getSouthWest(),
                        f = [],
                        l = (u.lat() - a.lat()) * i.clustering.clusterSize / 100;
                    for (s = 0; s < n.length; s += 1) n[s].latitude < u.lat() && n[s].latitude > a.lat() && n[s].longitude < u.lng() && n[s].longitude > a.lng() && (f[f.length] = n[s]);
                    i.log && console.log("number of markers " + f.length + "/" + n.length);
                    i.log && console.log("cluster radius: " + l);
                    for (s = 0; s < f.length; s += 1) {
                        u = -1;
                        for (n = 0; n < r.length && !(a = r[n].dist(f[s]), a < l && (u = n, i.clustering.fastClustering)); n += 1); - 1 === u ? (n = new t, n.addMarker(f[s]), r[r.length] = n) : r[u].addMarker(f[s])
                    }
                    i.log && console.log("Total clusters in viewport: " + r.length);
                    for (n = 0; n < r.length; n += 1) r[n].getMarker().setMap(e.gmap)
                } else {
                    var c = this;
                    window.setTimeout(function() {
                        o._renderCluster.apply(c)
                    }, 1e3)
                }
            },
            _processMarker: function(e, t, r, i) {
                var s = this.data("gmap"),
                    o = s.gmap,
                    u = s.opts,
                    a;
                void 0 === i && (i = new n.LatLng(e.latitude, e.longitude));
                if (!t) {
                    var f = {
                        image: u.icon.image,
                        iconSize: new n.Size(u.icon.iconsize[0], u.icon.iconsize[1]),
                        iconAnchor: new n.Point(u.icon.iconanchor[0], u.icon.iconanchor[1]),
                        infoWindowAnchor: new n.Size(u.icon.infowindowanchor[0], u.icon.infowindowanchor[1])
                    };
                    
                    t = new n.MarkerImage(f.image, f.iconSize, null, f.iconAnchor)
                }
                r || (new n.Size(u.icon.shadowsize[0], u.icon.shadowsize[1]), f && f.iconAnchor || new n.Point(u.icon.iconanchor[0], u.icon.iconanchor[1]));
                t = {
                    position: i,
                    icon: t,
                    title: e.title,
                    map: null,
                    draggable: !0 === e.draggable ? !0 : !1
                };
                u.clustering.enabled || (t.map = o);
                a = new n.Marker(t);
                a.setShadow(r);
                s.markers.push(a);
                e.key && (s.markerKeys[e.key] = a);
                var l;
                e.html && (r = {
                    content: "string" === typeof e.html ? u.html_prepend + e.html + u.html_append : e.html,
                    pixelOffset: e.infoWindowAnchor
                }, u.log && console.log("setup popup with data"), u.log && console.log(r), l = new n.InfoWindow(r), n.event.addListener(a, "click", function() {
                    u.log && console.log("opening popup " + e.html);
                    u.singleInfoWindow && s.infoWindow && s.infoWindow.close();
                    l.open(o, a);
                    s.infoWindow = l
                }));
                e.html && e.popup && (u.log && console.log("opening popup " + e.html), l.open(o, a), s.infoWindow = l);
                e.onDragEnd && n.event.addListener(a, "dragend", function(t) {
                    u.log && console.log("drag end");
                    e.onDragEnd(t)
                })
            },
            _geocodeMarker: function(e, t, u) {
                var a = this;
                r.geocode({
                    address: e.address
                }, function(r, f) {
                    f === n.GeocoderStatus.OK ? (i -= 1, a.data("gmap").opts.log && console.log("Geocode was successful with point: ", r[0].geometry.location), o._processMarker.apply(a, [e, t, u, r[0].geometry.location])) : (f === n.GeocoderStatus.OVER_QUERY_LIMIT && (!a.data("gmap").opts.noAlerts && 0 === s && alert("Error: too many geocoded addresses! Switching to 1 marker/s mode."), s += 1e3, window.setTimeout(function() {
                        o._geocodeMarker.apply(a, [e, t, u])
                    }, s)), a.data("gmap").opts.log && console.log("Geocode was not successful for the following reason: " + f))
                })
            },
            _autoZoom: function(t, n) {
                var r = e(this).data("gmap"),
                    i = e.extend({}, r ? r.opts : {}, t),
                    s, u, r = 39135.758482;
                i.log && console.log("autozooming map");
                s = n ? o._getBoundariesFromMarkers.apply(this) : o._getBoundaries(i);
                i = 111e3 * (s.E - s.W) / this.width();
                u = 111e3 * (s.S - s.N) / this.height();
                for (s = 2; 20 > s && !(i > r || u > r); s += 1) r /= 2;
                return s - 2
            },
            addMarkers: function(e) {
                var t = this.data("gmap").opts;
                if (0 !== e.length) {
                    t.log && console.log("adding " + e.length + " markers");
                    for (t = 0; t < e.length; t += 1) o.addMarker.apply(this, [e[t]])
                }
            },
            addMarker: function(e) {
                var t = this.data("gmap").opts;
                t.log && console.log("putting marker at " + e.latitude + ", " + e.longitude + " with address " + e.address + " and html " + e.html);
                var r = t.icon.image,
                    s = new n.Size(t.icon.iconsize[0], t.icon.iconsize[1]),
                    u = new n.Point(t.icon.iconanchor[0], t.icon.iconanchor[1]),
                    a = new n.Size(t.icon.infowindowanchor[0], t.icon.infowindowanchor[1]),
                    f = t.icon.shadow,
                    l = new n.Size(t.icon.shadowsize[0], t.icon.shadowsize[1]),
                    c = new n.Point(t.icon.shadowanchor[0], t.icon.shadowanchor[1]);
                e.infoWindowAnchor = a;
                e.icon && (e.icon.image && (r = e.icon.image), e.icon.iconsize && (s = new n.Size(e.icon.iconsize[0], e.icon.iconsize[1])), e.icon.iconanchor && (u = new n.Point(e.icon.iconanchor[0], e.icon.iconanchor[1])), e.icon.infowindowanchor && new n.Size(e.icon.infowindowanchor[0], e.icon.infowindowanchor[1]), e.icon.shadow && (f = e.icon.shadow), e.icon.shadowsize && (l = new n.Size(e.icon.shadowsize[0], e.icon.shadowsize[1])), e.icon.shadowanchor && (c = new n.Point(e.icon.shadowanchor[0], e.icon.shadowanchor[1])));
                if (e.icon.iconsize === undefined) {
                    r = new n.MarkerImage(r);
                } else {
                    r = new n.MarkerImage(r, null, null, null, s);
                }
                
                f = new n.MarkerImage(f, l, null, c);
                e.address ? ("_address" === e.html && (e.html = e.address), "_address" == e.title && (e.title = e.address), t.log && console.log("geocoding marker: " + e.address), i += 1, o._delayedMode = true, o._geocodeMarker.apply(this, [e, r, f])) : ("_latlng" === e.html && (e.html = e.latitude + ", " + e.longitude), "_latlng" == e.title && (e.title = e.latitude + ", " + e.longitude), t = new n.LatLng(e.latitude, e.longitude), o._processMarker.apply(this, [e, r, f, t]))
            },
            removeAllMarkers: function() {
                var e = this.data("gmap").markers,
                    t;
                for (t = 0; t < e.length; t += 1) e[t].setMap(null), delete e[t];
                e.length = 0
            },
            getMarker: function(e) {
                return this.data("gmap").markerKeys[e]
            },
            fixAfterResize: function(e) {
                var t = this.data("gmap");
                if (t!== undefined) {
                    n.event.trigger(t.gmap, "resize");
                    //e && t.gmap.panTo(new google.maps.LatLng(0, 0));
                    var center = this.gMapResp("_getMapCenter", t.opts);
                    if (center !== undefined && [center] != [0, 0]) {
                        t.gmap.panTo(center);
                    }
                }
                
            },
            setZoom: function(e, t, n) {
                var r = this.data("gmap").gmap;
                "fit" === e && (e = o._autoZoom.apply(this, [t, n]));
                r.setZoom(parseInt(e))
            },
            changeSettings: function(e) {
                var t = this.data("gmap"),
                    n = [],
                    r;
                for (r = 0; r < t.markers.length; r += 1) n[r] = {
                    latitude: t.markers[r].getPosition().lat(),
                    longitude: t.markers[r].getPosition().lng()
                };
                e.markers = n;
                e.zoom && o.setZoom.apply(this, [e.zoom, e]);

                if (e.latitude || e.longitude) {
                    var center = o._getMapCenter.apply(this, [e]);
                    if (center !== undefined && [center] != [0, 0]) {
                        t.gmap.panTo(center);
                    }
                }
            },
            mapclick: function(e) {
                google.maps.event.addListener(this.data("gmap").gmap, "click", function(t) {
                    e(t.latLng)
                })
            },
            geocode: function(e, t, i) {
                r.geocode({
                    address: e
                }, function(e, r) {
                    r === n.GeocoderStatus.OK ? t(e[0].geometry.location) : i && i(e, r)
                })
            },
            getRoute: function(t) {
                var r = this.data("gmap"),
                    i = r.gmap,
                    s = new n.DirectionsRenderer,
                    o = new n.DirectionsService,
                    u = {
                        BYCAR: n.DirectionsTravelMode.DRIVING,
                        BYBICYCLE: n.DirectionsTravelMode.BICYCLING,
                        BYFOOT: n.DirectionsTravelMode.WALKING
                    },
                    a = {
                        MILES: n.DirectionsUnitSystem.IMPERIAL,
                        KM: n.DirectionsUnitSystem.METRIC
                    },
                    f = null,
                    l = null,
                    c = null;
                void 0 !== t.routeDisplay ? f = t.routeDisplay instanceof jQuery ? t.routeDisplay[0] : "string" == typeof t.routeDisplay ? e(t.routeDisplay)[0] : null : null !== r.opts.routeFinder.routeDisplay && (f = r.opts.routeFinder.routeDisplay instanceof jQuery ? r.opts.routeFinder.routeDisplay[0] : "string" == typeof r.opts.routeFinder.routeDisplay ? e(r.opts.routeFinder.routeDisplay)[0] : null);
                s.setMap(i);
                null !== f && s.setPanel(f);
                l = void 0 !== u[r.opts.routeFinder.travelMode] ? u[r.opts.routeFinder.travelMode] : u.BYCAR;
                c = void 0 !== a[r.opts.routeFinder.travelUnit] ? a[r.opts.routeFinder.travelUnit] : a.KM;
                o.route({
                    origin: t.from,
                    destination: t.to,
                    travelMode: l,
                    unitSystem: c
                }, function(t, i) {
                    i == n.DirectionsStatus.OK ? s.setDirections(t) : null !== f && e(f).html(r.opts.routeFinder.routeErrors[i])
                });
                return this
            }
        };
    e.fn.gMapResp = function(t) {
        if (o[t]) return o[t].apply(this, Array.prototype.slice.call(arguments, 1));
        if ("object" === typeof t || !t) return o.init.apply(this, arguments);
        e.error("Method " + t + " does not exist on jQuery.gmap")
    };
    e.fn.gMapResp.defaults = {
        log: !1,
        noAlerts: !0,
        address: "",
        latitude: null,
        longitude: null,
        zoom: 3,
        maxZoom: null,
        minZoom: null,
        markers: [],
        controls: {},
        scrollwheel: !0,
        maptype: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: !0,
        zoomControl: !0,
        draggable: !0,
        scaleControl: !1,
        streetViewControl: !0,
        fullscreenControl: !0,
        controlsPositions: {
            mapType: null,
            zoom: null,
            scale: null,
            streetView: null
        },
        controlsStyle: {
            mapType: google.maps.MapTypeControlStyle.DEFAULT,
            zoom: google.maps.ZoomControlStyle.DEFAULT
        },
        singleInfoWindow: true,
        html_prepend: '<div class="gmap_marker">',
        html_append: "</div>",
        icon: {
            image: "https://www.google.com/mapfiles/marker.png",
            iconsize: [20, 34],
            iconanchor: [9, 34],
            infowindowanchor: [0, 0],
            shadow: "https://www.google.com/mapfiles/shadow50.png",
            shadowsize: [37, 34],
            shadowanchor: [9, 34]
        },
        onComplete: function() {},
        routeFinder: {
            travelMode: "BYCAR",
            travelUnit: "KM",
            routeDisplay: null,
            routeErrors: {
                INVALID_REQUEST: "The provided request is invalid.",
                NOT_FOUND: "One or more of the given addresses could not be found.",
                OVER_QUERY_LIMIT: "A temporary error occured. Please try again in a few minutes.",
                REQUEST_DENIED: "An error occured. Please contact us.",
                UNKNOWN_ERROR: "An unknown error occured. Please try again.",
                ZERO_RESULTS: "No route could be found within the given addresses."
            }
        },
        clustering: {
            enabled: !1,
            fastClustering: !1,
            clusterCount: 10,
            clusterSize: 40
        }
    }
})(jQuery)

/*!
 * Retina.js v1.3.0
 *
 * Copyright 2014 Imulus, LLC
 * Released under the MIT license
 *
 * Retina.js is an open source script that makes it easy to serve
 * high-resolution images to devices with retina displays.
 */
! function() {
    function a() {}

    function b(a) {
        return f.retinaImageSuffix + a
    }

    function c(a, c) {
        if (this.path = a || "", "undefined" != typeof c && null !== c) this.at_2x_path = c, this.perform_check = !1;
        else {
            if (void 0 !== document.createElement) {
                var d = document.createElement("a");
                d.href = this.path, d.pathname = d.pathname.replace(g, b), this.at_2x_path = d.href
            } else {
                var e = this.path.split("?");
                e[0] = e[0].replace(g, b), this.at_2x_path = e.join("?")
            }
            this.perform_check = !0
        }
    }

    function d(a) {
        this.el = a, this.path = new c(this.el.getAttribute("src"), this.el.getAttribute("data-at2x"));
        var b = this;
        this.path.check_2x_variant(function(a) {
            a && b.swap()
        })
    }
    var e = "undefined" == typeof exports ? window : exports,
        f = {
            retinaImageSuffix: "@2x",
            check_mime_type: !0,
            force_original_dimensions: !0
        };
    e.Retina = a, a.configure = function(a) {
        null === a && (a = {});
        for (var b in a) a.hasOwnProperty(b) && (f[b] = a[b])
    }, a.init = function(a) {
        null === a && (a = e);
        var b = a.onload || function() {};
        a.onload = function() {
            var a, c, e = document.getElementsByTagName("img"),
                f = [];
            for (a = 0; a < e.length; a += 1) c = e[a], c.getAttributeNode("data-no-retina") || f.push(new d(c));
            b()
        }
    }, a.isRetina = function() {
        var a = "(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-resolution: 1.5dppx)";
        return e.devicePixelRatio > 1 ? !0 : e.matchMedia && e.matchMedia(a).matches ? !0 : !1
    };
    var g = /\.\w+$/;
    e.RetinaImagePath = c, c.confirmed_paths = [], c.prototype.is_external = function() {
        return !(!this.path.match(/^https?\:/i) || this.path.match("//" + document.domain))
    }, c.prototype.check_2x_variant = function(a) {
        var b, d = this;
        return this.is_external() ? a(!1) : this.perform_check || "undefined" == typeof this.at_2x_path || null === this.at_2x_path ? this.at_2x_path in c.confirmed_paths ? a(!0) : (b = new XMLHttpRequest, b.open("HEAD", this.at_2x_path), b.onreadystatechange = function() {
            if (4 !== b.readyState) return a(!1);
            if (b.status >= 200 && b.status <= 399) {
                if (f.check_mime_type) {
                    var e = b.getResponseHeader("Content-Type");
                    if (null === e || !e.match(/^image/i)) return a(!1)
                }
                return c.confirmed_paths.push(d.at_2x_path), a(!0)
            }
            return a(!1)
        }, b.send(), void 0) : a(!0)
    }, e.RetinaImage = d, d.prototype.swap = function(a) {
        function b() {
            c.el.complete ? (f.force_original_dimensions && (c.el.setAttribute("width", c.el.offsetWidth), c.el.setAttribute("height", c.el.offsetHeight)), c.el.setAttribute("src", a)) : setTimeout(b, 5)
        }
        "undefined" == typeof a && (a = this.path.at_2x_path);
        var c = this;
        b()
    }, a.isRetina() && a.init(e)
}();

