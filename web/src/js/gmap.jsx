import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Map, GoogleApiWrapper } from 'google-maps-react';

const mapStyles = {
  map: {
    position: 'absolute',
    width: '100%',
    height: '400px',
  }
};

var map;
var panorama;
var svAvail;

export class CoordMaps extends Component {

 
  constructor(props) {

    super(props);
    this.state = {
      lat: this.props.lat,
      lng: this.props.lng,
      //svAvail: true,
      
    };
  }

  getGoogleMaps() {

    // If we haven't already defined the promise, define it
    if (!this.googleMapsPromise) {
      this.googleMapsPromise = new Promise((resolve) => {
        // Add a global handler for when the API finishes loading
        window.resolveGoogleMapsPromise = () => {
          // Resolve the promise
          resolve(google);

          // Tidy up
          delete window.resolveGoogleMapsPromise;
        };

        // Load the Google Maps API
        const script = document.createElement("script");
        const API = 'AIzaSyCj3w76q7Rrps00-S2-kl0hW7ZqCWd-vn4';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API}&callback=resolveGoogleMapsPromise`;
        script.async = true;
        document.body.appendChild(script);
      });
    }

    // Return a promise for the Google Maps API
    return this.googleMapsPromise;
  }

  render() {

    // Once the Google Maps API has finished loading, initialize the map
    this.getGoogleMaps().then((google) => {
      
      var sv = new google.maps.StreetViewService();
      const position = {lat: Number(this.props.lat), lng: Number(this.props.lng)};

      panorama = new google.maps.StreetViewPanorama(document.getElementById('svMap'));

      map = new google.maps.Map(document.getElementById('gmMap'), {
        zoom: 15,
        center: position,
        streetViewControl: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        rotateControl: true,
        fullscreenControl: false
      });
      
      panorama = new google.maps.StreetViewPanorama(document.getElementById("svMap"));

        // Set the initial Street View camera to the center of the map
        sv.getPanoramaByLocation(position, 200, processSVData);

        // Look for a nearby Street View panorama when the map is clicked.
        // getPanoramaByLocation will return the nearest pano when the
        // given radius is 50 meters or less.
        google.maps.event.addListener(map, 'click', function(event) {
            sv.getPanoramaByLocation(event.latLng, 1000, processSVData);
        });
  
    });

    return (
      <div>
      <div className='row py-1 '>
        <div id="gmMap" style={{height: 350, width: '98%', marginright: 'auto', marginleft: 'auto', position: 'relative', display: 'block'}}></div>
      </div>
      <div className='row py-1 '>
        <div id="svMap" style={{height: 550, width: '98%', marginleft: 'auto', marginright: 'auto', position: 'relative', display: 'block'}}></div>
      </div>
        
      </div>
    )
  }
}


function processSVData(data, status) {

    svAvail = true;

    if (status == google.maps.StreetViewStatus.OK) {
      //var marker = new google.maps.Marker({
      //  position: data.location.latLng,
      //  map: map,
      //  title: data.location.description
      //});

      panorama.setPano(data.location.pano);
      panorama.setPov({
        heading: 270,
        pitch: 0
      });
      panorama.setVisible(true);

      google.maps.event.addListener("", 'click', function() {

        var markerPanoID = data.location.pano;
        // Set the Pano to use the passed panoID
        panorama.setPano(markerPanoID);
        panorama.setPov({
          heading: 270,
          pitch: 0
        });
        panorama.setVisible(true);
        
      });
    } else {
      
    }
}


export default (CoordMaps);
//ReactDOM.render(<CoordMaps />, document.getElementById('react'));