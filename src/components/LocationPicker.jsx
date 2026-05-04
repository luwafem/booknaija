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
  
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const timeoutRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(function () {
    if (!document.getElementById('leaflet-css')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.id = 'leaflet-css';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
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
          fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(initialQuery + ' Nigeria') + '&limit=1&addressdetails=1')
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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    var marker = L.marker([startLat, startLng], { draggable: true }).addTo(map);

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

  // --- SEARCH LOGIC ---
  function runSearch() {
    if (searchQuery.length < 2) return;
    setSearchResults([]);
    clearTimeout(searchTimeoutRef.current);

    var querySuffix = searchQuery.includes(',') ? '' : ' Nigeria';

    fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(searchQuery + querySuffix) + '&limit=10&addressdetails=1')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setSearchResults(data && data.length > 0 ? data : []);
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

    if (val.length < 3) return;

    var querySuffix = val.includes(',') ? '' : ' Nigeria';

    searchTimeoutRef.current = setTimeout(runSearch, 400);
  }

  function selectSearchResult(result) {
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',').slice(0, 2).join(',').trim());
    
    var newLat = parseFloat(result.lat);
    var newLng = parseFloat(result.lon);
    
    setLat(newLat);
    setLng(newLng);
    setAddress(result.display_name);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([newLat, newLng], 18); 
      markerRef.current.setLatLng([newLat, newLng]);
    }
  }

  // --- GPS CURRENT LOCATION LOGIC ---
  function handleGps() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

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
        
        var msg = (err.message || '').toLowerCase();
        
        // Handle Local HTTP testing / Iframe missing permissions
        if (msg.includes('permissions policy') || msg.includes('disabled in this document') || msg.includes('insecure context')) {
          alert("GPS is blocked by your browser's security rules. This happens when testing on a local HTTP server (like stella:55). Don't worry — the GPS button will work perfectly for your users on your live HTTPS site!");
        } 
        // Handle user clicking "Block" on the popup
        else if (err.code === 1) {
          alert("Location permission denied. Please enable it in your browser's site settings.");
        } 
        // Handle timeout/no signal
        else {
          alert("Could not get your location. Please ensure location is turned on and try again.");
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
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">Pin Your Exact Location</h3>
            <p className="text-[10px] text-stone-500 mt-0.5">Search, use GPS, or drag the pin</p>
          </div>
          <button type="button" onClick={onClose} className="text-stone-500 hover:text-white transition-colors p-1 text-lg">✕</button>
        </div>

        <div ref={mapRef} className="w-full bg-stone-900 relative overflow-hidden" style={{ height: '350px' }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-900 z-[1000]">
              <div className="w-6 h-6 border-2 border-stone-600 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900 z-[1000] p-6">
              <div className="text-red-400 text-3xl mb-3">⚠️</div>
              <p className="text-xs text-stone-300 text-center mb-4">{error}</p>
              <button type="button" onClick={handleRetry} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors">Try Again</button>
            </div>
          )}
          
          {!loading && !error && (
            <div className="absolute top-3 left-3 right-3 z-[1001] flex flex-col">
              <div className="flex gap-1.5 shadow-lg">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={function(e) { if (e.key === 'Enter') runSearch(); }}
                    placeholder="e.g. 12 Allen Avenue, Ikeja"
                    className="w-full bg-black/80 backdrop-blur-md text-white text-xs rounded-lg pl-9 pr-3 py-2.5 border border-white/20 placeholder-stone-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                
                <button 
                  type="button" 
                  onClick={runSearch} 
                  className="px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                <button 
                  type="button" 
                  onClick={handleGps} 
                  disabled={gpsLoading}
                  className="px-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 active:scale-95"
                  title="Use my current location"
                >
                  {gpsLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                    </svg>
                  )}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-1 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden max-h-48 overflow-y-auto shadow-xl">
                  {searchResults.map(function (r) {
                    return (
                      <button 
                        key={r.place_id} 
                        type="button"
                        onClick={function () { selectSearchResult(r); }}
                        className="w-full text-left px-3 py-2.5 text-xs text-stone-200 hover:bg-white/10 border-b border-white/5 last:border-0 transition-colors flex items-start gap-2.5"
                      >
                        <svg className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <span className="line-clamp-2 block font-medium leading-snug">{r.display_name}</span>
                          <span className="text-[10px] text-stone-500 capitalize block mt-0.5">{(r.type || '').replace(/_/g, ' ')}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="bg-white/5 rounded-lg p-2.5">
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold mb-1">Selected Address</p>
            <p className="text-xs text-stone-200 leading-snug line-clamp-2">{address}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-medium text-stone-400 bg-white/5 hover:bg-white/10 transition-colors">Cancel</button>
            <button type="button" onClick={handleSave} disabled={!lat || error} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-black bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:bg-stone-800">Confirm Pin</button>
          </div>
        </div>
      </div>
    </div>
  );
}