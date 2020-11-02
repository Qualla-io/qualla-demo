import { ethers } from "ethers";

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener("load", async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          resolve(provider);
        } catch (error) {
          reject(error);
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        const provider = new ethers.providers.Web3Provider(web3)
        console.log("Injected web3 detected.");
        resolve(provider);
      }
      // Fallback to localhost; use dev console port by default...
      else {
        const provider = new ethers.providers.JsonRpcProvider();
        console.log("No web3 instance injected, using Local web3.");
        resolve(provider);
      }
    });
  });

export default getWeb3;
