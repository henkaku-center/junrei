import React from 'react';
import ReactDOM from 'react-dom';
import {ethers} from 'ethers';
import {ContractABI} from './nftabi';
import {JUNREI_CONTRACT_ADDRESS} from "./appconfig";
import CoordMaps from './gmap';


const lat_samp =  ["43.6119", "52.3803", "34.446632", "30.309563", "35.3597", "8.92772"];
const lng_samp =  ["3.8772", "4.6406", "133.995296", "-104.02061", "35.9214", "-75.0264" ];
const cityLabel_samp = ["Montpellier, Occitanie, France",
                        "Haarlem, Noord-Holland, Netherlands",
                        "Naoshima, Kagawa, Japan",
                        "Marfa, Texas, United States",
                        "Jablah, Al L\u0101dhiq\u012byah, Syria",
                        "San Benito Abad, Sucre, Colombia"
                        ];    
const ocMap_samp =  ["/assets/img/maps/sample/map1.png",
                    "/assets/img/maps/sample/map2.png",
                    "/assets/img/maps/sample/map3.png",
                    "/assets/img/maps/sample/map4.png",
                    "/assets/img/maps/sample/map5.png",
                    "/assets/img/maps/sample/map6.png"
                    ];
const isOwner_samp = [false, false, false, false, false, false ];
const latLongLabel_samp = ["43.6119, 3.8772",
                            "52.3803, 4.6406", 
                            "34.446632, 133.995296",
                            "30.309563, -104.02061",
                            "35.3597, 35.9214",
                            "8.92772, -75.0264"
                        ];

class Coordinates extends React.Component {
    constructor(props) {

        super(props);
        this.connectWallet = this.connectWallet.bind(this);
        this.disconnectWallet = this.disconnectWallet.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.setActiveMap = this.setActiveMap.bind(this);
        this.loadSampleData = this.loadSampleData.bind(this);
        
        this.state = {
            hasWallet: Boolean(window.ethereum),
            hasTokens: false,
            isWalletConnected: false,
            walletAddress: null,
            walletDisplay: null,
            activeMap: 0, 
            lat: [],
            lng: [],
            cityLabel: [],    
            ocMap: [],
            latLongLabel: [],
            isOwner: [],            
        };

        //if wallet isn't connected, load map object with sample data
        if (this.state.isWalletConnected == false){
            
            this.loadSampleData();
        } 
    };


    async connectWallet() {
        try {

            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await provider.send("eth_requestAccounts", []);
            provider.on("network", (newNetwork, oldNetwork) => {
                // Reload when the user switches networks (ex: testnet to mainnet), for safety
                if (oldNetwork) {
                    window.location.reload();
                }
            });

            const signer = provider.getSigner();
            const walletAddress = await signer.getAddress();
            this.state.walletDisplay = walletAddress.substring(0, 5) + "..." + (walletAddress.substring(walletAddress.length - 4));

            //check wallet for tokens/load data
            const contract =  new ethers.Contract(JUNREI_CONTRACT_ADDRESS, ContractABI, provider);
            const connectedContract = contract.connect(signer);
            const tokenCount = await connectedContract.balanceOf(walletAddress);

            if (tokenCount > 0) {

                for (let i = 0; i < tokenCount; i++) {
                    //get token ID & JSON URI
                    const tokenID = await connectedContract.tokenOfOwnerByIndex(walletAddress, i);
                    const ipfsAddr = await connectedContract.tokenURI(tokenID);
                    let tokenData = await this.loadIPFSData(ipfsAddr, i);

                    //prepend token data to sample data array (so the sample data will still be available for the experience)    
                    this.state.lat.unshift(tokenData.lat);
                    this.state.lng.unshift(tokenData.lng);
                    this.state.latLongLabel.unshift(tokenData.latLongLabel);
                    this.state.cityLabel.unshift(tokenData.cityLabel);
                    this.state.ocMap.unshift(tokenData.ocMap);
                    this.state.isOwner.unshift(true);
                }
                
                //If wallet has tokens but the IFPS can't be read load sample data
                //Fixes a pre-mint bug
                if (this.state.lat.length == 0) {
                    this.loadSampleData();
                    this.setState({isWalletConnected: true, walletAddress: walletAddress, activeMap: 0, hasTokens: false});
                } else {
                    this.setState({isWalletConnected: true, walletAddress: walletAddress, activeMap: 0, hasTokens: true});
                }
            } else {
                this.setState({isWalletConnected: true, walletAddress: walletAddress, activeMap: 0, hasTokens: false});
            }
            
        } catch (e) {
            console.error(e);
        }
    }

    disconnectWallet() {
        this.setState({isWalletConnected: false, walletAddress: null});
    }

    async loadIPFSData(ipfsAddr, i) {
        const ipfsGateway = "https://cloudflare-ipfs.com/ipfs/";
        const url = ipfsGateway + ipfsAddr.slice(7);
        try {
            let response = await (await fetch(url)).json();
            let latVal = response.attributes[0].value;
            let longVal = response.attributes[1].value;
            return {
                lat: latVal,
                lng: longVal,
                latLongLabel: latVal + ", " + longVal,
                cityLabel: response.description,
                ocMap: ipfsGateway + response.image.slice(7),
            }
          }
          catch(err) {
            console.log(err);
          } 
    }

    setActiveMap(i){
        this.setState({activeMap: i});
    }
    
    loadSampleData(){
        this.state.lat = lat_samp;
        this.state.lng  = lng_samp;
        this.state.cityLabel  = cityLabel_samp;    
        this.state.ocMap = ocMap_samp;
        this.state.latLongLabel = latLongLabel_samp;
        this.state.isOwner = isOwner_samp;
    }
  
    render() {
        let activeMapInt = parseInt(this.state.activeMap);
        var cityArray = this.state.cityLabel[activeMapInt].split(',');
        let cityDisp = null;
        let countryDisp = cityArray[cityArray.length - 1];
        
        if (cityArray.length > 2) {
            cityDisp = cityArray[0] + ", " + cityArray[1];
        } else {
            cityDisp = cityArray[0];
        }
          
        return(
            
            <div>
                <div id="mapSection" className="container ">

                    <div className="row ">    
                        {this.renderWalletHeader()}
                    </div> 
                    <div id='headerRow' className="row py-1 ">
                        <div id='mapTitle' className="col-lg-7 col-md-7 col-sm-6 col-xs-6">
                            
                            <h2>
                                <span className="" id="cityName"> {cityDisp} <br/> {countryDisp} </span>
                            </h2>
                            <h4>
                                <span className="text-muted" id="latLongLabel">{this.state.latLongLabel[activeMapInt]}</span>
                            </h4>
                            <h5>
                                <span className=""><a href="#" data-bs-toggle="modal" data-bs-target="#coordModal">(change location)</a></span>
                            </h5>
                            
                        </div>
                        <div className="pl-3 d-none d-sm-block col-lg-5 col-md-5 col-sm-6">

                            <a href="#" data-bs-toggle="modal" data-bs-target="#mapModal">
                                <img id="ocMap"  src={this.state.ocMap[activeMapInt]} className="float-end border-black border" alt="OpenCoordinate Map"></img>    
                            </a>

                        </div>
                    </div>

                    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/15.1.0/react.min.js"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/15.1.0/react-dom.min.js"></script>
                    <div id="react"></div>                 

                    
                    <CoordMaps lat={this.state.lat[activeMapInt]} lng={this.state.lng[activeMapInt]} />
                    
                </div>
        
            {this.renderModal()}
             </div>
        );
    }

    //sub-render method to create wallet label 
    renderWalletHeader(){

        if (this.state.hasWallet) {
            if (this.state.isWalletConnected) {

                //wallet connected 
                return (
                    <div id='walletLabelDisp' className="text-end py-1">
                        <div>
                            <span id='userWallet' className="text-gray-600 "></span>
                            <a href="" id='clearWallet' className="text-gray-600 float-right">Connected to: {this.state.walletDisplay} &nbsp;
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#575757"  className="icon" xmlSpace="preserve" viewBox="0 0 50 50" stroke="rgb(87, 87, 87)" fill="rgb(87, 87, 87)" overflow="visible"  strokeWidth="4" strokeLinecap="square">
                                <line fill = "#575757" x2="30" y2="30" />
                                <line fill = "#575757" x1="30" y2="30" />   
                                </svg>
                            </a>
                        </div>
                    </div> 
                )
                
            } else {
            
                //no wallet connected (inital state)
                return (
                    <div className="text-end py-2">
                        <span className="text-gray-600 float-right py-1">
                        <a href="#" className="btn-xs btn-primary lift " onClick={this.connectWallet} >Connect Wallet</a></span>
                    </div> 
                    
                )
            }
        } else {
            //no ethereum wallet detected
            return (
                <div className="row ">
                    <div className="text-end py-1">
                        <a target="_blank"  className="btn-xs btn-secondary-soft lift" onClick={this.connectWallet} >Install Metamask</a>
                    </div> 
                </div>
            )
        }
    }

    //sub-render method to create city modal to select different locations
    renderModal() {

        let activeMapInt = parseInt(this.state.activeMap);
        const items = [];
        let sampleFlag = null;

        for (var i = 0; i < this.state.cityLabel.length; i++) {

            let mapIndex = i;

            var cityArray = this.state.cityLabel[i].split(',');
            let cityDisp = null;
            let countryDisp = cityArray[cityArray.length - 1];
            
            if (cityArray.length > 2) {
                cityDisp = cityArray[0] + ", " + cityArray[1];
            } else {
                cityDisp = cityArray[0];
            }
            

            if (this.state.isOwner[i]) {
                sampleFlag = "your location";
            } else {
                sampleFlag = "(sample)";
            }

            items.push(
                <div className = "pb-6 row no-gutters " key={mapIndex}>
                    <div className="col-4 ">
                        <a href="#" type="button"  data-bs-dismiss="modal" onClick={ () => this.setActiveMap(mapIndex) } >
                            <img src={this.state.ocMap[i]}  className="ocModal border-black border" height="125"  alt="..."></img>
                        </a>
                    </div>
                    <div className="col-8 ">
                        <a href="#" type="button"  data-bs-dismiss="modal" onClick={ () => this.setActiveMap(mapIndex) } >{cityDisp} <br/> {countryDisp} </a><br/>
                        <h6 className="text-muted"><i>{ sampleFlag }</i></h6>
                    </div>
                </div>
                )
          }
        
        return(
            <div>
            <div className="modal fade" id="coordModal" >
              <div className="modal-dialog">
                <div className="modal-content">     
                    <div className="modal-body">
                        <div id="modalItems" className="row">
                        {items}
                        </div> 
                    </div>
                </div>
              </div>
            </div>   


            <div className="modal fade bd-example-modal-lg" id="mapModal"  role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-body">
                    <div id="modalItems" className="row text-center">
                         <img  src={this.state.ocMap[activeMapInt]} className="border-black " alt="OpenCoordinate Map"></img>
                        <h3>
                            <span className="text-center" id="cityName">{this.state.cityLabel[activeMapInt]}</span>
                        </h3>
                    </div> 
                  </div>
                </div>
              </div>
            </div>  

        </div>   
        );
    } 
}

<script src="./bundle.js"></script>

ReactDOM.render(<Coordinates />, document.getElementById('coordHelper'));
