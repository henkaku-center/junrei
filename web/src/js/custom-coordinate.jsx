import React from 'react';
import ReactDOM from 'react-dom';
import {ethers} from 'ethers';
//import {ContractABI} from './nftabi';
//import {JUNRAI_CONTRACT_ADDRESS} from "./appconfig";
//import CoordMaps from './gmap';

class CustomCoordinate extends React.Component {
     constructor(props) {

        super(props);

        //this.connectWallet = this.connectWallet.bind(this);
        
        this.state = {
            //hasWallet: Boolean(window.ethereum),
            //isOwner: [],            
        };

    };


  

    render() {
        
        return (
            <div id="mapSection" className="container ">
            <div className="pt-4 pt-md-9" >
                <div class="form-group">
                    <label for="exampleInputEmail1">Address</label>
                    <input type="address" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter address"></input>
                </div>
                
                <button type="submit" class="btn btn-primary">Submit</button>
            </div>
        </div>
        )
    }


}

<script src="./bundle.js"></script>

ReactDOM.render(<CustomCoordinate />, document.getElementById('custCoords'));
