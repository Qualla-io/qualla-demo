import { ethers } from "ethers";
import Dai from "./abi/TestDai.json";
import Diamond from "./abi/Diamond.sol/QuallaDiamond.json.";
import ERC1155 from "./abi/facets/ERC1155Facet.sol/ERC1155Facet.json";
import Subscriptions from "./abi/facets/QuallaSubscriptionFacet.sol/QuallaSubscriptionsFacet.json";
import NFT from "./abi/facets/QuallaNFTFactet.sol/QuallaNFTFacet.json";

function instantiate(abi, provider, account) {
  var contract = new ethers.Contract(process.env.SUB_CONTRACT, abi, provider);

  return contract.connect(account);
}

const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URI);
const account = new ethers.Wallet(privateKey, provider);
var dai = new ethers.Contract(process.env.DAI_CONTRACT, Dai.abi, provider);

dai = dai.connect(account);

var diamond = instantiate(Diamond.abi, provider, account);
var erc1155 = instantiate(ERC1155.abi, provider, account);
var subscriptions = instantiate(Subscriptions.abi, provider, account);
var nft = instantiate(NFT.abi, provider, account);

module.exports = {
  provider,
  account,
  dai,
  diamond,
  erc1155,
  subscriptions,
  nft,
};
