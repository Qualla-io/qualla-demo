//SPDX-License-Identifier: Unlicense
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./QuallaSubscription.sol";

import "hardhat/console.sol";

contract QuallaNFT is QuallaSubscription {
    using SafeMath for uint256;

    constructor(string memory uri_, uint256 chainId_)
        QuallaSubscription(uri_, chainId_)
    {}

    mapping(uint256 => string) baseNftToUri;
    mapping(uint256 => uint256) public test;

    function mintBatchNFT(
        address creator,
        uint256 amount,
        string memory _uri,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        require(amount > 0, "Qualla/Insufficient-Amount");

        // verify signature

        _verifySignature(creator, "nft", v, r, s);

        uint256[] memory ids = new uint256[](amount);
        uint256[] memory amounts = new uint256[](amount);

        uint256 id = (tokenNonce << 128);
        id = (id | TYPE_NF_BIT);

        baseNftToUri[id] = _uri;

        // console.log(~(~id | TYPE_NF_BIT));

        for (uint256 i = 0; i < amount + 0; i++) {
            ids[i] = id | i;
            amounts[i] = 1;
            test[i + 1] = id | i;
        }

        _mintBatch(msg.sender, ids, amounts, bytes(""));

        tokenNonce++;
    }

    function uri(uint256 id) external view override returns (string memory) {
        uint256 baseId = id & NONCE_MASK;
        return baseNftToUri[baseId];
    }
}
