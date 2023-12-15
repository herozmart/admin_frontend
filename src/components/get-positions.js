import React from "react";
import {usePlacesWidget} from "react-google-autocomplete";
import {useTranslation} from "react-i18next";
import {MAP_API_KEY} from "../configs/app-global";

const GetPosition = ({setLocation, address, setAddress}) => {
    const {t} = useTranslation();

    const {ref} = usePlacesWidget({
        apiKey: MAP_API_KEY,
        onPlaceSelected: (place) => {
            const location = {
                lat: place?.geometry.location.lat(),
                lng: place?.geometry.location.lng()
            };
            setLocation(location);
            setAddress(place?.formatted_address)
        },
    });
    return (
        <input
            className="address-input"
            onChange={(e) => setAddress(e.target.value)}
            value={address}
            ref={ref}
            placeholder={t("")}
        />
    );
};

export default GetPosition;
