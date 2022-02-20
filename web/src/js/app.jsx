import {ethers} from 'ethers';
import {ContractABI} from './nftabi';
import { JUNREI_PRELAUNCH, JUNREI_CONTRACT_ADDRESS } from "./appconfig";
import React from 'react';


export class ContractInteractor extends React.Component {
    constructor(props) {
        super(props);
        this.connectWallet = this.connectWallet.bind(this);
        this.disconnectWallet = this.disconnectWallet.bind(this);
        this.state = {
            hasWallet: Boolean(window.ethereum),
            isWalletConnected: false,
            walletProvider: null,
            walletAddress: null
        };
    }
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
            this.setState({isWalletConnected: true, walletProvider: provider, walletAddress: walletAddress});
        } catch (e) {
            console.error(e);
        }
    }
    disconnectWallet() {
        this.setState({isWalletConnected: false, walletProvider: null, walletAddress: null});
    }
    render() {

        return (
            <div>
                <React.StrictMode />
                <div className="row pt-4">
                    <div className="col text-center">
                        <MintInstructions
                            hasWallet={this.state.hasWallet}
                            isWalletConnected={this.state.isWalletConnected}
                            walletProvider={this.state.walletProvider}
                            connectWallet={this.connectWallet}
                            preLaunch={JUNREI_PRELAUNCH} />
                     </div>
                </div>
                <div className="row pt-4">
                    <WalletStatus walletAddress={this.state.walletAddress} disconnectWallet={this.disconnectWallet} />
                </div>
            </div>
            )
    }
}

export class ConnectWalletButton extends React.Component {
    constructor(props) {
        super(props);
        this.connectWallet = this.connectWallet.bind(this);
        this.state = {
            isConnecting: false
        };
    }
    render() {
        if (this.state.isConnecting) {
            return <a className="btn btn-secondary lift" target="_blank">Connecting...</a>
        }
        return <a className="btn btn-primary lift" onClick={this.connectWallet} target="_blank">Connect Wallet</a>
    }
    async connectWallet() {
        this.setState({isConnecting: true});
        this.props.connectWallet();
        this.setState({isConnecting: false});
    }
}

export class MintButton extends React.Component {
    constructor(props) {
        super(props);
        this.resetMint = this.resetMint.bind(this);
        this.mintToken = this.mintToken.bind(this);
        this.state = {
            isMinting: false,
            mintResult: null
        };
    }
    render() {
        if (this.state.isMinting) {
            return <a className="btn btn-secondary cursor-not-allowed lift" target="_blank">Minting...</a>
        }
        if (this.state.mintResult === true) {
            return <a className="btn btn-primary btn-success lift" onClick={this.resetMint} target="_blank">Minted!</a>
        } else if (this.state.mintResult === false) {
            return <a className="btn btn-primary btn-error lift" onClick={this.resetMint} target="_blank">Mint failed. Try again?</a>
        }
        return <a className="btn btn-primary lift" onClick={this.mintToken} target="_blank">Mint Coordinate</a>

    }
    resetMint() {
        this.setState({mintResult: null});
    }
    async mintToken() {
        const contract =  new ethers.Contract(JUNREI_CONTRACT_ADDRESS, ContractABI, this.props.provider);
        const signer = this.props.provider.getSigner();
        const connectedContract = contract.connect(signer);
        this.setState({isMinting: true});
        try {
            const tx = await connectedContract.claim();
            const result = await tx.wait();
            this.setState({isMinting: false, mintResult: true});
        } catch (e) {
            console.error(e);
            this.setState({isMinting: false, mintResult: false});
        }
    }
}

export function InstallMetamaskButton(props) {
    return <a className="btn btn-secondary-soft cursor-not-allowed" target="_blank">Install MetaMask to Mint</a>
}

export function WalletStatus(props) {
    if (!props.walletAddress) {
        return null;
    }
    const shortUserWalletAddress = props.walletAddress.substring(0, 5) + "..." + (props.walletAddress.substring(props.walletAddress.length - 4));

    return (
        <div className="col text-center">
            <span className='text-lg text-gray-600'>(Connected to: {shortUserWalletAddress}) </span>
            <a onClick={props.disconnectWallet} target="_blank" className='text-lg text-gray-600'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="#575757"  className="icon" xmlSpace="preserve" viewBox="0 0 50 50" stroke="rgb(87, 87, 87)" fill="rgb(87, 87, 87)" overflow="visible"  stroke-width="4" stroke-linecap="square">
                    <line fill = "#575757" x2="30" y2="30" />
                    <line fill = "#575757" x1="30" y2="30" />   
                </svg>
            </a>
        </div>
    )
}

function MintInstructions(props) {
    if (props.preLaunch) {
        let etherscanMintUrl = <a href="https://etherscan.io/address/0xC62100d52AF39e64a2AF00e25849509d5192D597#writeContract">Etherscan</a>;
        return (<div><a className="btn btn-secondary-soft cursor-not-allowed" target="_blank">Launching Friday!</a>
                
                <p>Early minting available through {etherscanMintUrl}.<br/>
                Never minted off a contract before? <a href="https://docs.google.com/document/d/14z7tRkL6WgK11K6EGU6rLqjvu5fOrPoAAKuiK8JEI6Q/edit">These instructions make it easy.</a></p>
                
                <p><i>(All items minted off contract will be revealed Friday ~11am EST/8am PST/1pm GMT)</i></p>
            </div>
        );
    }
    if (props.hasWallet) {
        if (props.isWalletConnected) {
            return <MintButton provider={props.walletProvider} />;
        } else {
            return <ConnectWalletButton connectWallet={props.connectWallet} />;
        }
    }

    if (window.screen.width < 768) {
        return (<div><a className="btn btn-secondary-soft cursor-not-allowed" target="_blank">Connect Wallet</a>
                <p>To mint, please visit us on your desktop or through the browser on your crypto wallet.</p></div>
                );
    }
    return <InstallMetamaskButton />;
}