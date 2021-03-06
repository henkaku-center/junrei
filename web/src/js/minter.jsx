import React, { useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import { ContractInteractor } from './app';
import { ethers } from "ethers";
import { ContractABI } from "./nftabi";
import { JUNREI_CONTRACT_ADDRESS, JUNREI_NETWORK } from "./appconfig";

ReactDOM.render(<ContractInteractor />, document.getElementById('interactor'));

function SupplyStats(props) {
    const [minted, setMinted] = useState(null);
    useEffect(() => {
      try {
        const contract = new ethers.Contract(
          JUNREI_CONTRACT_ADDRESS,
          ContractABI,
          ethers.getDefaultProvider(JUNREI_NETWORK)
        );
        contract.totalSupply().then((value) => setMinted(value));
      } catch (e) {
        console.log(e);
      }
    }, []);

    return (
      <p className="text-center text-muted">
        (This button is a WPI, do not mint). <br />

      </p>
    );
  }
  
  ReactDOM.render(<SupplyStats />, document.getElementById("supply"));
  