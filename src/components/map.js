import GoogleMapReact from 'google-map-react';
import { MAP_API_KEY } from '../configs/app-global';
import pinIcon from '../assets/images/pin.png';
import getAddressFromLocation from '../helpers/getAddressFromLocation';
import { shallowEqual, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import locations from '../assets/images/locations.png';

const Marker = () => <img src={pinIcon} width='32' alt='Pin' />;

export default function Map({ location, setLocation, setAddress = () => {} }) {
  const [loc, setLoc] = useState();
  const { google_map_key } = useSelector(
    (state) => state.globalSettings.settings,
    shallowEqual
  );

  async function onClickMap(event) {
    const location = {
      lat: event.lat,
      lng: event.lng,
    };
    setLocation(location);
    const address = await getAddressFromLocation(location, google_map_key);
    setAddress(address);
  }

  const currentLocation = () => {
    navigator.geolocation.getCurrentPosition(function (position) {
      setLoc({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  };

  useEffect(() => {
    currentLocation();
  }, []);

  return (
    <div className='map-container' style={{ height: 400, width: '100%' }}>
      <button
        className='map-button'
        type='button'
        onClick={() => {
          currentLocation();
          onClickMap(loc);
        }}
      >
        <img src={locations} alt='img' />
      </button>
      <GoogleMapReact
        bootstrapURLKeys={{ key: google_map_key || MAP_API_KEY }}
        defaultZoom={15}
        center={location}
        onClick={onClickMap}
        options={{
          fullscreenControl: false,
        }}
      >
        <Marker lat={location.lat} lng={location.lng} />
      </GoogleMapReact>
    </div>
  );
}
