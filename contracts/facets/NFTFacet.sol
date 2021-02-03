// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../interfaces/INFTFacet.sol";

import "../libraries/LibAppStorage.sol";
import "../libraries/LibERC1155.sol";

contract NFTFacet is INFTFacet, LibAppBase {
    using SafeMath for uint256;

    function mintNFTtoSubscribers(
        uint256 tierTokenId,
        string memory _uri,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public override {

        LibERC1155.verifySignature(
            state.tierToken[tierTokenId].creator,
            "nft",
            v,
            r,
            s
        );

        uint256 id = (state.tokenNonce.add(1) << 128);
        id = (id | LibAppStorage.TYPE_NF_BIT);

        state.test = id;

        state.nftToken[id] = NFTToken(
            _uri,
            block.timestamp,
            tierTokenId,
            1,
            state.tierToken[tierTokenId].creator
        );

        // Amounts = tierToken.nonce is going to mint extra nfts for burnt sub tokens but thats ok for now.
        LibERC1155._mint(
            state.tierToken[tierTokenId].creator,
            id,
            state.tierToken[tierTokenId].activeBeams,
            bytes("")
        );

        state.tokenNonce = state.tokenNonce.add(1);
    }

    function mintNFTtoSubscribersBatch(
        uint256[] memory tierTokenId,
        string memory _uri,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public override {
        address creator = state.tierToken[tierTokenId[0]].creator;

        LibERC1155.verifySignature(creator, "nft", v, r, s);

        uint256[] memory ids = new uint256[](tierTokenId.length);
        uint256[] memory amounts = new uint256[](tierTokenId.length);

        for (uint256 i; i < tierTokenId.length; i++) {
            require(
                state.tierToken[tierTokenId[i]].creator == creator,
                "Qualla/Invalid Creator"
            );

            ids[i] = (state.tokenNonce.add(1) << 128);
            ids[i] = (ids[i] | LibAppStorage.TYPE_NF_BIT);

            // same amounts comment as above
            amounts[i] = state.tierToken[tierTokenId[i]].activeBeams;

            state.nftToken[ids[i]] = NFTToken(
                _uri,
                block.timestamp,
                tierTokenId[i],
                1,
                creator
            );

            state.tokenNonce = state.tokenNonce.add(1);
        }

        LibERC1155._mintBatch(
            state.tierToken[tierTokenId[0]].creator,
            ids,
            amounts,
            bytes("")
        );
    }

    function claimNFT(
        address user,
        uint256 beamTokenId,
        uint256 nftTokenId,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public override {
        LibERC1155.verifySignature(user, "claim", v, r, s);

        LibERC1155.ERC1155Storage storage erc1155 = LibERC1155.erc1155Storage();

        require(
            erc1155._balances[beamTokenId][user] > 0,
            "Qualla/Invalid User"
        );
        require(
            beamTokenId & LibAppStorage.NONCE_MASK ==
                state.nftToken[nftTokenId].tierToken,
            "Qualla/Invalid Redeem"
        );
        require(
            //Subtoken must be minted before nft
            state.beamToken[beamTokenId].mintStamp <
                state.nftToken[nftTokenId].mintStamp,
            "Qualla/Invalid mintstamp"
        );
        require(
            state.nftRedeemed[nftTokenId][beamTokenId] == false,
            "Qualla/Already Redeemed"
        );

        uint256 id = nftTokenId | state.nftToken[nftTokenId].nonce;

        LibERC1155._mint(user, id, 1, bytes(""));
        LibERC1155._burn(state.nftToken[nftTokenId].creator, nftTokenId, 1);

        state.nftRedeemed[nftTokenId][beamTokenId] = true;
    }
}
