import { ethers } from "ethers";
import Diamond from "./abi/Diamond.sol/QuallaDiamond.json";
import ERC1155 from "./abi/facets/ERC1155Facet.sol/ERC1155Facet.json";
import BeamTokens from "./abi/facets/BeamTokenFacet.sol/BeamTokenFacet.json";
import TierTokens from "./abi/facets/TierTokenFacet.sol/TierTokenFacet.json";
import NFT from "./abi/facets/NFTFacet.sol/NFTFacet.json";
import Factory from "./abi/facets/TokenFactoryFacet.sol/TokenFactoryFacet.json";

function instantiate(abi, provider, account) {
  var contract = new ethers.Contract(process.env.SUB_CONTRACT, abi, provider);

  return contract.connect(account);
}

const privateKey = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_URI);
const account = new ethers.Wallet(privateKey, provider);

var diamond = instantiate(Diamond.abi, provider, account);
var erc1155Facet = instantiate(ERC1155.abi, provider, account);
var tierTokenFacet = instantiate(TierTokens.abi, provider, account);
var beamTokenFacet = instantiate(BeamTokens.abi, provider, account);
var nftFacet = instantiate(NFT.abi, provider, account);
var factoryFacet = instantiate(Factory.abi, provider, account);

module.exports = {
  provider,
  account,
  diamond,
  erc1155Facet,
  tierTokenFacet,
  beamTokenFacet,
  nftFacet,
  factoryFacet,
};
