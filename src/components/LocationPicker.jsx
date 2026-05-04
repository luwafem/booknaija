import { useState, useEffect, useRef } from 'react';

export default function LocationPicker({ initialQuery, onSave, onClose }) {
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [address, setAddress] = useState(initialQuery || 'Loading...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsAllowed, setGpsAllowed] = useState(true);
  
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const timeoutRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(function () {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).catch(function() {
        setGpsAllowed(false);
      });
    } else if (!navigator.geolocation) {
      setGpsAllowed(false);
    }
  }, []);

  useEffect(function () {
    if (!document.getElementById('leaflet-css')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.id = 'leaflet-css';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-custom-css')) {
      var style = document.createElement('style');
      style.id = 'leaflet-custom-css';
      style.textContent = '.custom-map-marker { background: transparent !important; border: none !important; }';
      document.head.appendChild(style);
    }

    if (!document.getElementById('leaflet-js')) {
      var script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      document.head.appendChild(script);
    }

    var attempts = 0;

    function tryInit() {
      attempts++;
      if (window.L) {
        clearTimeout(timeoutRef.current);
        if (mapInstanceRef.current) return; 

        if (initialQuery) {
          fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(initialQuery) + '&limit=1&addressdetails=1&countrycodes=ng')
            .then(function (r) { return r.json(); })
            .then(function (data) {
              if (mapInstanceRef.current) return; 
              if (data && data.length > 0) {
                initMap(parseFloat(data[0].lat), parseFloat(data[0].lon));
                setAddress(data[0].display_name);
                setLat(parseFloat(data[0].lat));
                setLng(parseFloat(data[0].lon));
              } else {
                initMap(6.5244, 3.3792);
                setAddress('Search or drag pin to your exact location');
              }
              setLoading(false);
            })
            .catch(function () {
              if (mapInstanceRef.current) return;
              initMap(6.5244, 3.3792);
              setAddress('Search or drag pin to your exact location');
              setLoading(false);
            });
        } else {
          initMap(6.5244, 3.3792);
          setLoading(false);
        }
        return;
      }
      if (attempts > 50) {
        setError('Map library failed to load.');
        setLoading(false);
        return;
      }
      setTimeout(tryInit, 100);
    }

    timeoutRef.current = setTimeout(function () {
      if (loading) {
        setError('Map loading timed out.');
        setLoading(false);
      }
    }, 10000);

    setTimeout(tryInit, 150);

    return function () {
      clearTimeout(timeoutRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      if (mapRef.current) delete mapRef.current._leaflet_id;
    };
  }, []);

  function initMap(startLat, startLng) {
    if (!mapRef.current || mapInstanceRef.current) return;
    var L = window.L;
    
    var map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([startLat, startLng], 16);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    var customIcon = L.divIcon({
      html: `<svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.164 0 0 7.164 0 16C0 28 16 44 16 44C16 44 32 28 32 16C32 7.164 24.836 0 16 0Z" fill="#7c3aed"/>
              <path d="M16 4C9.373 4 4 9.373 4 16C4 25 16 38 16 38C16 38 28 25 28 16C28 9.373 22.627 4 16 4Z" fill="#8b5cf6"/>
              <circle cx="16" cy="15" r="6" fill="white"/>
            </svg>`,
      className: 'custom-map-marker',
      iconSize: [32, 44],
      iconAnchor: [16, 44],
      popupAnchor: [0, -40]
    });

    var marker = L.marker([startLat, startLng], { draggable: true, icon: customIcon }).addTo(map);

    marker.on('dragend', function (e) {
      var pos = e.target.getLatLng();
      setLat(pos.lat);
      setLng(pos.lng);
      setAddress('Fetching address...');
      fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + pos.lat + '&lon=' + pos.lng + '&addressdetails=1')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          setAddress(data && data.display_name ? data.display_name : pos.lat.toFixed(4) + ', ' + pos.lng.toFixed(4));
        })
        .catch(function () {
          setAddress(pos.lat.toFixed(4) + ', ' + pos.lng.toFixed(4));
        });
    });

    markerRef.current = marker;
    mapInstanceRef.current = map;
    setTimeout(function () { map.invalidateSize(); }, 200);
  }

  // Universal formatter for both Photon and Nominatim results
  function formatAddress(props) {
    var parts = [];
    if (props.name && props.name !== props.city) parts.push(props.name);
    if (props.street) parts.push(props.street);
    if (props.city || props.town || props.village) parts.push(props.city || props.town || props.village);
    if (props.state) parts.push(props.state);
    return parts.join(', ') || 'Unknown Location';
  }

  function runSearch() {
    if (searchQuery.length < 2) return;
    setSearchResults([]);
    clearTimeout(searchTimeoutRef.current);

    var query = searchQuery;

    // STRATEGY: Try Photon first. If it finds nothing, fallback to Nominatim restricted to Nigeria.
    fetch('https://photon.komoot.io/api/?q=' + encodeURIComponent(query) + '&limit=5&lat=6.5244&lon=3.3792')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.features && data.features.length > 0) {
          setSearchResults(data.features);
        } else {
          // FALLBACK: Nominatim with countrycodes=ng. 
          // This tells Nominatim "only look in Nigeria" WITHOUT corrupting the search text with the word "Nigeria"
          return fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query) + '&limit=10&addressdetails=1&countrycodes=ng')
            .then(function(r) { return r.json(); })
            .then(function(nData) {
              if (nData && nData.length > 0) {
                // Convert Nominatim format into Photon format so the rest of the code works seamlessly
                var converted = nData.map(function(item) {
                  return {
                    properties: {
                      name: item.address && (item.address.road || item.address.suburb || item.address.neighbourhood) ? (item.address.road || item.address.suburb || item.address.neighbourhood) : item.display_name.split(',')[0],
                      street: item.address ? (item.address.road || item.address.pedestrian) : null,
                      city: item.address ? (item.address.city || item.address.town || item.address.village) : null,
                      state: item.address ? item.address.state : null,
                      type: item.type || 'place',
                      osm_id: item.place_id
                    },
                    geometry: {
                      type: "Point",
                      coordinates: [parseFloat(item.lon), parseFloat(item.lat)]
                    }
                  };
                });
                setSearchResults(converted);
              } else {
                setSearchResults([]);
              }
            });
        }
      })
      .catch(function () {
        setSearchResults([]);
      });
  }

  function handleSearchChange(e) {
    var val = e.target.value;
    setSearchQuery(val);
    setSearchResults([]);
    clearTimeout(searchTimeoutRef.current);

    if (val.length < 2) return;

    searchTimeoutRef.current = setTimeout(runSearch, 300);
  }

  function selectSearchResult(result) {
    setSearchResults([]);
    var props = result.properties || {};
    var displayName = formatAddress(props);
    setSearchQuery(props.name || displayName.split(',').slice(0, 2).join(',').trim());
    
    var newLng = parseFloat(result.geometry.coordinates[0]);
    var newLat = parseFloat(result.geometry.coordinates[1]);
    
    setLat(newLat);
    setLng(newLng);
    setAddress(displayName);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([newLat, newLng], 18); 
      markerRef.current.setLatLng([newLat, newLng]);
    }
  }

  function handleGps() {
    if (!navigator.geolocation) return;

    setGpsLoading(true);
    setSearchResults([]);

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        var newLat = pos.coords.latitude;
        var newLng = pos.coords.longitude;
        
        setLat(newLat);
        setLng(newLng);
        setAddress('Fetching exact address...');
        setSearchQuery('Current Location');

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 18);
          markerRef.current.setLatLng([newLat, newLng]);
        }

        fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + newLat + '&lon=' + newLng + '&addressdetails=1')
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data && data.display_name) {
              setAddress(data.display_name);
              setSearchQuery(data.display_name.split(',').slice(0, 2).join(',').trim());
            } else {
              setAddress(newLat.toFixed(6) + ', ' + newLng.toFixed(6));
            }
            setGpsLoading(false);
          })
          .catch(function () {
            setAddress(newLat.toFixed(6) + ', ' + newLng.toFixed(6));
            setGpsLoading(false);
          });
      },
      function (err) {
        console.error(err);
        setGpsLoading(false);
        setGpsAllowed(false); 
        
        if ((err.message || '').toLowerCase().includes('permissions policy') || (err.message || '').toLowerCase().includes('disabled in this document')) {
        } else if (err.code === 1) {
          alert("Location permission denied in browser settings.");
        } else {
          alert("Could not get location. Check device settings.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  function handleSave() {
    if (lat && lng) {
      var cleanAddress = address.split(',').slice(0, 4).join(',').trim();
      onSave({ lat: lat, lng: lng, address: cleanAddress });
    }
  }

  function handleRetry() {
    setError(null);
    setLoading(true);
    mapInstanceRef.current = null;
    if (mapRef.current) delete mapRef.current._leaflet_id;
    
    var js = document.getElementById('leaflet-js');
    if (js) js.remove();
    
    var script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    document.head.appendChild(script);
    
    var attempts = 0;
    function tryInit() {
      attempts++;
      if (window.L) {
        initMap(lat || 6.5244, lng || 3.3792);
        setLoading(false);
        return;
      }
      if (attempts > 50) {
        setError('Map library failed to load.');
        setLoading(false);
        return;
      }
      setTimeout(tryInit, 100);
    }
    setTimeout(tryInit, 200);
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">Pin Your Exact Location</h3>
            <p className="text-[10px] text-stone-500 mt-0.5">Search or drag the pin to your doorway</p>
          </div>
          <button type="button" onClick={onClose} className="text-stone-500 hover:text-white transition-colors p-1 text-lg">✕</button>
        </div>

        <div ref={mapRef} className="w-full bg-stone-100 relative overflow-hidden" style={{ height: '380px' }}>
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 z-[1000] gap-3">
              <div className="w-8 h-8 border-2 border-stone-300 border-t-purple-500 rounded-full animate-spin"></div>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold">Loading HD Map</p>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 z-[1000] p-6">
              <div className="text-red-500 text-3xl mb-3">⚠️</div>
              <p className="text-xs text-stone-600 text-center mb-4">{error}</p>
              <button type="button" onClick={handleRetry} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors">Try Again</button>
            </div>
          )}
          
          {!loading && !error && (
            <div className="absolute top-3 left-3 right-3 z-[1001] flex flex-col">
              <div className="flex gap-1.5 shadow-xl shadow-black/10">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={function(e) { if (e.key === 'Enter') runSearch(); }}
                    placeholder="e.g. 'lekki phase 1', 'ikeja mall'"
                    className="w-full bg-white/95 backdrop-blur-xl text-stone-800 text-xs rounded-lg pl-9 pr-3 py-2.5 border border-stone-200 placeholder-stone-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
                
                <button 
                  type="button" 
                  onClick={runSearch} 
                  className="px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center active:scale-95 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {gpsAllowed && (
                  <button 
                    type="button" 
                    onClick={handleGps} 
                    disabled={gpsLoading}
                    className="px-3 bg-white/95 hover:bg-white border border-stone-200 text-stone-600 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 active:scale-95 shadow-sm"
                    title="Use my current location"
                  >
                    {gpsLoading ? (
                      <div className="w-4 h-4 border-2 border-stone-300 border-t-purple-600 rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="mt-1 bg-white/95 backdrop-blur-xl border border-stone-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto shadow-xl shadow-black/10">
                  {searchResults.map(function (r) {
                    var props = r.properties || {};
                    var addr = formatAddress(props);
                    return (
                      <button 
                        key={props.osm_id || Math.random()} 
                        type="button"
                        onClick={function () { selectSearchResult(r); }}
                        className="w-full text-left px-3 py-2.5 text-xs text-stone-700 hover:bg-stone-50 border-b border-stone-100 last:border-0 transition-colors flex items-start gap-2.5"
                      >
                        <svg className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <span className="line-clamp-2 block font-medium leading-snug text-stone-800">{addr}</span>
                          <span className="text-[10px] text-stone-400 capitalize block mt-0.5">{(props.type || 'place').replace(/_/g, ' ')}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 space-y-3 bg-[#0a0a0a]">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold mb-1">Selected Address</p>
            <p className="text-xs text-stone-200 leading-snug line-clamp-2">{address}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl text-xs font-semibold text-stone-400 bg-white/5 hover:bg-white/10 transition-colors border border-white/5">Cancel</button>
            <button type="button" onClick={handleSave} disabled={!lat || error} className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all active:scale-[0.98] disabled:opacity-40 disabled:bg-stone-800 shadow-lg shadow-purple-900/20">Confirm Pin</button>
          </div>
        </div>
      </div>
    </div>
  );
}