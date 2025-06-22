import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import polyline from 'polyline';
import 'leaflet/dist/leaflet.css';

const SamplePage = () => {
  // State để lưu các giá trị nhập từ người dùng và dữ liệu đường đi
  const [latlngs, setLatlngs] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);
  const [startCoord, setStartCoord] = useState({ lat: '', lng: '' });
  const [endCoord, setEndCoord] = useState({ lat: '', lng: '' });
  const [routeInfo, setRouteInfo] = useState(null);

  // Hàm gọi API để tìm đường
  const fetchRoute = () => {
    const url = `https://graphhopper.com/api/1/route?point=${startCoord.lat},${startCoord.lng}&point=${endCoord.lat},${endCoord.lng}&vehicle=car&key=f8620a35-ab3c-438a-a573-c38120f57482&locale=vn`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.paths && data.paths.length > 0) {
          const encodedPolyline = data.paths[0].points;
          const decodedPolyline = polyline.decode(encodedPolyline);
          const newLatLngs = decodedPolyline.map((coord) => [coord[0], coord[1]]);

          setLatlngs(newLatLngs);

          // Tính toán và set map bounds
          const bounds = newLatLngs.reduce((bounds, latlng) => bounds.extend(latlng), new L.LatLngBounds());
          setMapBounds(bounds);

          // Lưu thông tin về lộ trình (ví dụ: thời gian, khoảng cách)
          setRouteInfo({
            distance: data.paths[0].distance / 1000, // Chuyển từ mét sang km
            time: (data.paths[0].time / 1000 / 60).toFixed(2) // Chuyển từ mili giây sang phút
          });
        } else {
          console.error('Không có tuyến đường nào được tìm thấy');
        }
      })
      .catch((error) => {
        console.error('Lỗi khi lấy tuyến đường:', error);
      });
  };

  // Hàm xử lý sự kiện khi người dùng bấm submit
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRoute(); // Gọi hàm tìm đường khi người dùng bấm submit
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
        width: '70vw',
        overflow: 'hidden',
        border: '2px solid #ddd',
        margin: '0 auto',
        flexDirection: 'column'
      }}
    >
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <label>
          Start Latitude:
          <input type="number" value={startCoord.lat} onChange={(e) => setStartCoord({ ...startCoord, lat: e.target.value })} required />
        </label>
        <label>
          Start Longitude:
          <input type="number" value={startCoord.lng} onChange={(e) => setStartCoord({ ...startCoord, lng: e.target.value })} required />
        </label>
        <br />
        <label>
          End Latitude:
          <input type="number" value={endCoord.lat} onChange={(e) => setEndCoord({ ...endCoord, lat: e.target.value })} required />
        </label>
        <label>
          End Longitude:
          <input type="number" value={endCoord.lng} onChange={(e) => setEndCoord({ ...endCoord, lng: e.target.value })} required />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>

      {routeInfo && (
        <div style={{ marginBottom: '20px' }}>
          <p>
            Distance: {routeInfo.distance} km <br />
            Duration: {routeInfo.time} minutes
          </p>
        </div>
      )}

      <MapContainer
        center={[10.128553, 106.470299]} // Trung tâm mặc định nếu không có route
        zoom={13}
        style={{ width: '500%', height: '500%' }}
        scrollWheelZoom={true}
        bounds={mapBounds} // Fit the map to polyline bounds
        whenCreated={(map) => map.invalidateSize()}
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&scale=2"
          attribution="Map data &copy; <a href='https://www.google.com/intl/en-US_US/help/terms_maps.html'>Google</a>"
        />

        {/* Hiển thị các Marker cho tọa độ bắt đầu và kết thúc */}
        {startCoord.lat && startCoord.lng && (
          <Marker position={[startCoord.lat, startCoord.lng]}>
            <Popup>
              Start: {startCoord.lat}, {startCoord.lng}
            </Popup>
          </Marker>
        )}
        {endCoord.lat && endCoord.lng && (
          <Marker position={[endCoord.lat, endCoord.lng]}>
            <Popup>
              End: {endCoord.lat}, {endCoord.lng}
            </Popup>
          </Marker>
        )}

        {/* Polyline */}
        <Polyline positions={latlngs} color="blue" />
      </MapContainer>
    </div>
  );
};

export default SamplePage;
