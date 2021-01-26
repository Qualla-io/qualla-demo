//SPDX-License-Identifier: Unlicense
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./QuallaSubscription.sol";

contract QuallaNFT is QuallaSubscription {
    using SafeMath for uint256;

    constructor(string memory uri_, uint256 chainId_)
        QuallaSubscription(uri_, chainId_)
    {}

    function mintNFT() public {
        // verify signature

        uint256 id = (tokenNonce << 128);
        id = (id | NF_INDEX_MASK);
        ERC1155._mint(msg.sender, id, 1, bytes(""));

        // Do something with data

        tokenNonce++;
    }
}
