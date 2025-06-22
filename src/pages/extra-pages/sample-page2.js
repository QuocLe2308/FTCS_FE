import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import polyline from 'polyline';
import 'leaflet/dist/leaflet.css';
import pointIcon from '../../assets/images/icons/point.png';
import { Button, Grid, TextField } from '@mui/material';
// Các chuyến đi cố định
const trips = [
  {
    id: 1,
    start: { lat: 10.717388, lng: 106.600147 }, // Hồ Chí Minh
    end: { lat: 9.177064, lng: 105.150208 }, // Cà Mau
    departureTime: '10:00',
    nameTrip: 'Hồ Chí Minh -> Cà Mau'
  },
  {
    id: 2,
    start: { lat: 10.544137, lng: 106.411715 }, // Long An
    end: { lat: 9.177064, lng: 105.150208 }, // Cà Mau
    departureTime: '11:00',
    nameTrip: 'Long An -> Cà Mau'
  },
  {
    id: 3,
    start: { lat: 11.313937, lng: 106.096367 }, // Tây Ninh
    end: { lat: 9.315392, lng: 105.719191 }, // Bạc Liêu
    departureTime: '10:00',
    nameTrip: 'Tây Ninh -> Bạc Liêu'
  }
];

const SamplePage = () => {
  const [startCoord, setStartCoord] = useState({ lat: '', lng: '' });
  const [endCoord, setEndCoord] = useState({ lat: '', lng: '' });
  const [sortedTrips, setSortedTrips] = useState([]);
  const customIcon = new L.Icon({
    iconUrl: pointIcon,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });

  const [currentPosition, setCurrentPosition] = useState(null);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setStartCoord({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const fetchCustomerLocation = (lat, lng) => {
    const url = `https://graphhopper.com/api/1/geocode?reverse=true&point=${lat},${lng}&key=f8620a35-ab3c-438a-a573-c38120f57482&locale=vi`;

    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.hits && data.hits.length > 0) {
          const location = data.hits[0];
          const street = location.name || '';
          const state = location.state || '';
          return `${street}, ${state}`;
        } else {
          console.error('Không tìm thấy địa chỉ cho tọa độ này');
          return 'Không xác định';
        }
      })
      .catch((error) => {
        console.error('Lỗi khi lấy thông tin vị trí:', error);
        return 'Không xác định';
      });
  };
  // Hàm gọi API để tìm đường
  const fetchRoute = (start, end) => {
    const url = `https://graphhopper.com/api/1/route?point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&vehicle=car&key=f8620a35-ab3c-438a-a573-c38120f57482&locale=vn`;

    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.paths && data.paths.length > 0) {
          const encodedPolyline = data.paths[0].points;
          const decodedPolyline = polyline.decode(encodedPolyline);
          const newLatLngs = decodedPolyline.map((coord) => [coord[0], coord[1]]);
          return { polyline: newLatLngs, time: data.paths[0].time / 1000 / 60, distance: data.paths[0].distance / 1000, paths: data.paths };
        } else {
          console.error('Không có tuyến đường nào được tìm thấy');
          return null;
        }
      })
      .catch((error) => {
        console.error('Lỗi khi lấy tuyến đường:', error);
        return null;
      });
  };

  // Hàm kiểm tra xem khách hàng có nằm trên tuyến đường chuyến đi không
  const isCustomerOnRoute = (customer, route) => {
    // Kiểm tra xem khách hàng có gần một trong các điểm trên tuyến đường không
    // Sử dụng khoảng cách giữa các điểm trên tuyến đường và vị trí khách hàng
    const threshold = 0.001; // Tầm gần (có thể điều chỉnh tùy theo yêu cầu)
    return route.some((point) => {
      const distance = Math.sqrt(Math.pow(point[0] - customer.lat, 2) + Math.pow(point[1] - customer.lng, 2));
      return distance < threshold;
    });
  };

  // Hàm xử lý sự kiện khi người dùng bấm submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const customerRoute = {
      start: { lat: parseFloat(startCoord.lat), lng: parseFloat(startCoord.lng) },
      end: { lat: parseFloat(endCoord.lat), lng: parseFloat(endCoord.lng) }
    };

    const startLocation = await fetchCustomerLocation(customerRoute.start.lat, customerRoute.start.lng);
    const endLocation = await fetchCustomerLocation(customerRoute.end.lat, customerRoute.end.lng);
    console.log('Vị trí bắt đầu:', startLocation);
    console.log('Vị trí kết thúc:', endLocation);

    const tripRoutes = await Promise.all(
      trips.map(async (trip) => {
        const routeToTrip = await fetchRoute(customerRoute.start, trip.start);
        const routeFromTrip = await fetchRoute(trip.end, customerRoute.end);

        if (routeToTrip && routeFromTrip) {
          let totalTime = routeToTrip.time + routeFromTrip.time;
          let totalDistance = routeToTrip.distance + routeFromTrip.distance;

          // Kiểm tra xem khách có nằm trên tuyến đường của chuyến đi không
          if (
            isCustomerOnRoute(customerRoute.start, routeToTrip.polyline) &&
            isCustomerOnRoute(customerRoute.end, routeFromTrip.polyline)
          ) {
            totalTime = routeToTrip.time + routeFromTrip.time;
            totalDistance = routeToTrip.distance + routeFromTrip.distance;
          }

          return {
            trip,
            routeToTrip,
            routeFromTrip,
            totalTime,
            time: totalTime,
            distance: totalDistance
          };
        }
        return null;
      })
    );

    // Sắp xếp các chuyến đi theo tổng thời gian
    const sorted = tripRoutes.filter(Boolean).sort((a, b) => a.time - b.time);
    setSortedTrips(sorted);

    // Chọn chuyến đi tốt nhất
    const bestTrip = sorted[0];

    if (bestTrip) {
      const { routeToTrip, routeFromTrip } = bestTrip;
      console.log(routeToTrip.paths[0]);
      // Hiển thị chỉ dẫn cho chuyến đi tốt nhất
      if (routeToTrip.paths[0].instructions) {
        routeToTrip.paths[0].instructions.forEach((instruction, index) => {
          console.log(`Bước ${index + 1} (Từ khách đến chuyến đi): ${instruction.text}, khoảng cách: ${instruction.distance} km`);
        });
      }
      if (routeFromTrip.paths[0].instructions) {
        routeFromTrip.paths[0].instructions.forEach((instruction, index) => {
          console.log(`Bước ${index + 1} (Từ chuyến đi đến khách): ${instruction.text}, khoảng cách: ${instruction.distance} km`);
        });
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '150vh',
        width: '70vw',
        overflow: 'hidden',
        border: '2px solid #ddd',
        margin: '0 auto',
        flexDirection: 'column'
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          margin: '20px auto',
          maxWidth: '500px',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6}>
            <TextField
              label="Start Latitude"
              type="number"
              fullWidth
              value={startCoord.lat}
              onChange={(e) => setStartCoord({ ...startCoord, lat: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Start Longitude"
              type="number"
              fullWidth
              value={startCoord.lng}
              onChange={(e) => setStartCoord({ ...startCoord, lng: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="End Latitude"
              type="number"
              fullWidth
              value={endCoord.lat}
              onChange={(e) => setEndCoord({ ...endCoord, lat: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="End Longitude"
              type="number"
              fullWidth
              value={endCoord.lng}
              onChange={(e) => setEndCoord({ ...endCoord, lng: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Submit
            </Button>
            <Button onClick={getLocation} color="primary">
              Find My Location
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Hiển thị thông tin các chuyến đi đã sắp xếp */}
      {sortedTrips.length > 0 && (
        <div>
          <h3>Chuyến đi sắp xếp theo thời gian:</h3>
          {sortedTrips.map((item, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <p>
                <strong>Chuyến {item.trip.id}</strong>: {item.trip.start.lat},{item.trip.start.lng} → {item.trip.end.lat},
                {item.trip.end.lng}
              </p>
              <p>
                <strong>Địa điểm:</strong> {item.trip.nameTrip}
              </p>
              <p>
                <strong>Tổng thời gian:</strong> {item.time.toFixed(2)} phút
              </p>
              <p>
                <strong>Tổng khoảng cách:</strong> {item.distance.toFixed(2)} km
              </p>
            </div>
          ))}
        </div>
      )}
      <MapContainer
        center={[10.128553, 106.470299]} // Trung tâm mặc định nếu không có route
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&scale=2"
          attribution="Map data &copy; <a href='https://www.google.com/intl/en-US_US/help/terms_maps.html'>Google</a>"
        />
        {/* Hiển thị các Marker cho tọa độ bắt đầu và kết thúc */}.
        {currentPosition && (
          <Marker position={[currentPosition.lat, currentPosition.lng]} icon={customIcon}>
            <Popup>
              Your Location: {currentPosition.lat}, {currentPosition.lng}
            </Popup>
          </Marker>
        )}
        {startCoord.lat && startCoord.lng && (
          <Marker position={[startCoord.lat, startCoord.lng]} icon={customIcon}>
            <Popup>
              Start: {startCoord.lat}, {startCoord.lng}
            </Popup>
          </Marker>
        )}
        {endCoord.lat && endCoord.lng && (
          <Marker position={[endCoord.lat, endCoord.lng]} icon={customIcon}>
            <Popup>
              End: {endCoord.lat}, {endCoord.lng}
            </Popup>
          </Marker>
        )}
        {/* Polyline */}
        {sortedTrips.length > 0 &&
          sortedTrips.map((item, index) => (
            <Polyline key={index} positions={item.routeToTrip.polyline.concat(item.routeFromTrip.polyline)} color="blue" />
          ))}
      </MapContainer>
    </div>
  );
};

export default SamplePage;
