import React, { Component } from 'react';
import { Map, GoogleApiWrapper } from 'google-maps-react';
import Streetview from 'react-google-streetview';
import PropTypes from 'prop-types';
import asyncLoading from 'react-async-loader';
import isEqual from 'lodash.isequal';


export class GoogleStreetview extends Component {

  constructor(props) {

    debugger 

    super(props);
    this.streetView = null;

    this.state = {
      initalRender: true,
      lat: this.props.lat,
      lng: this.props.lng,
    };
  }

  componentDidMount() {

    this.initialize(this.node, this.props);
  }

  componentDidUpdate(prevProps) {

    debugger

    this.initialize(this.node, prevProps);
  }

  componentWillUnmount() {
    if (this.streetView) {
      this.props.googleMaps.event.clearInstanceListeners(this.streetView);
    }
  }

  initialize(canvas, prevProps) {

    debugger

    if (this.props.googleMaps && this.streetView == null) {
      this.streetView = new this.props.googleMaps.StreetViewPanorama(
        canvas,
        this.props.streetViewPanoramaOptions,
      );

      this.streetView.addListener('pano_changed', () => {
        if (this.props.onPanoChanged) {
          this.props.onPanoChanged(this.streetView.getPano());
        }
      });

      this.streetView.addListener('position_changed', () => {
        if (this.props.onPositionChanged) {
          this.props.onPositionChanged(this.streetView.getPosition());
        }
      });

      this.streetView.addListener('pov_changed', () => {
        if (this.props.onPovChanged) {
          this.props.onPovChanged(this.streetView.getPov());
        }
      });

      this.streetView.addListener('visible_changed', () => {
        if (this.props.onVisibleChanged) {
          this.props.onVisibleChanged(this.streetView.getVisible());
        }
      });

      this.streetView.addListener('zoom_changed', () => {
        if (this.props.onZoomChanged) {
          this.props.onZoomChanged(this.streetView.getZoom());
        }
      });
    }
    if (
      this.streetView !== null &&
      this.props.streetViewPanoramaOptions &&
      !isEqual(
        this.props.streetViewPanoramaOptions,
        prevProps.streetViewPanoramaOptions,
      )
    ) {
      const {
        zoom,
        pov,
        position,
        ...otherOptions
      } = this.props.streetViewPanoramaOptions;
      const {
        zoom: prevZoom,
        pov: prevPov,
        position: prevPos,
        ...prevOtherOptions
      } = prevProps.streetViewPanoramaOptions;
      if (!isEqual(zoom, prevZoom)) {
        this.streetView.setZoom(zoom);
      }
      if (!isEqual(pov, prevPov)) {
        this.streetView.setPov(pov);
      }
      if (!isEqual(position, prevPos)) {
        this.streetView.setPosition(position);
      }
      if (!isEqual(otherOptions, prevOtherOptions)) {
        this.streetView.setOptions(otherOptions);
      }
    }
  }

  render() {

    debugger

    console.log("old Latitude = " + GoogleStreetview.defaultProps.streetViewPanoramaOptions.position.lat); 
    console.log("old Longitude = " + GoogleStreetview.defaultProps.streetViewPanoramaOptions.position.lng); 
    //GoogleStreetview.defaultProps.streetViewPanoramaOptions.position.lat = Number(this.state.lat);
    //GoogleStreetview.defaultProps.streetViewPanoramaOptions.position.lng = Number(this.state.lng);
    console.log("new Latitude = " + GoogleStreetview.defaultProps.streetViewPanoramaOptions.position.lat); 
    console.log("new Longitude = " + GoogleStreetview.defaultProps.streetViewPanoramaOptions.position.lng); 

    return <div style={{ height: '100%' }} ref={node => (this.node = node)} />;
  }
}

GoogleStreetview.propTypes = {
  /* eslint-disable react/no-unused-prop-types */
  apiKey: PropTypes.string,
  streetViewPanoramaOptions: PropTypes.object,
  onPositionChanged: PropTypes.func,
  onPovChanged: PropTypes.func,
  onZoomChanged: PropTypes.func,
  onPanoChanged: PropTypes.func,
  onVisibleChanged: PropTypes.func,
  googleMaps: PropTypes.object,
};
  
GoogleStreetview.defaultProps = {
  apiKey: 'AIzaSyA7pxtjcHDlnSr76a8L9oiO-aUBcVeH7Hg',
  streetViewPanoramaOptions: {
    position: { lat: 46.9171876, lng: 17.8951832 },
    pov: { heading: 0, pitch: 0 },
    zoom: 1,
  },
  googleMaps: {},
  onPositionChanged: () => {},
  onPovChanged: () => {},
  onZoomChanged: () => {},
  onPanoChanged: () => {},
  onVisibleChanged: () => {},
};

function mapScriptsToProps({ apiKey }) {
  if (!apiKey) return {};

  return {
    googleMaps: {
      
      globalPath: 'google.maps',
      url: `https://maps.googleapis.com/maps/api/js?key=AIzaSyA7pxtjcHDlnSr76a8L9oiO-aUBcVeH7Hg`,
      jsonp: true,
    },
  };
}


export default asyncLoading(mapScriptsToProps)(GoogleStreetview);


  /*  
  render() {
    
  debugger

    //refresh state with the properties passed in
    this.state.lat = this.props.lat;
    this.state.lng = this.props.lng;
    
    //
    // Note: by passing "initalCenter" on the first call and then "center" on all subsequent calls, you will force the map refresh
    //
    if (this.state.initalRender) {
       
      this.state.initalRender = false;

      return (
        <div id='gmRow' className="row py-1  border">
            <div className="" id="refMap">
            <Streetview
              google={this.props.google}
              zoom={16}
              style={mapStyles}
              initialCenter={
                {
                  lat: this.state.lat,
                  lng: this.state.lng
                }
              }
            />
        </div>
      </div>
      );

    } else {

      return (
        <div id='gmRow' className="row py-1  border">
            <div className="" id="refMap">
            <Streetview
              google={this.props.google}
              zoom={16}
              style={mapStyles}
              center={
                {
                  lat: this.state.lat,
                  lng: this.state.lng
                }
              }
            />
        </div>
      </div>
      );
    }     
  }

  
export default GoogleApiWrapper({
  apiKey: 'AIzaSyA7pxtjcHDlnSr76a8L9oiO-aUBcVeH7Hg'
})(GSVContainer);
*/
