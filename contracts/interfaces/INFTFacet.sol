// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "../libraries/LibAppStorage.sol";

interface INFTFacet {
    // --- Read Functions -------------------------

    // --- Write Functions ------------------------
    function mintNFTtoSubscribers(
        uint256 baseTokenId,
        string memory _uri,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function mintNFTtoSubscribersBatch(
        uint256[] memory baseTokenId,
        string memory _uri,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function claimNFT(
        address user,
        uint256 beamTokenId,
        uint256 nftTokenId,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}
