// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../libraries/LibSubscriptions.sol";
import "../libraries/LibERC1155.sol";

contract QuallaNFTFacet {
    using SafeMath for uint256;

    uint256 constant NONCE_MASK = uint256(uint128(~0)) << 128;
    uint256 constant NF_INDEX_MASK = uint128(~0);
    uint256 constant TYPE_NF_BIT = 1 << 255;

    function mintNFTtoSubscribers(
        uint256 baseTokenId,
        string memory _uri,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        LibERC1155.verifySignature(
            ss.baseToken[baseTokenId].creator,
            "nft",
            v,
            r,
            s
        );

        uint256 id = (ss.tokenNonce.add(1) << 128);
        id = (id | TYPE_NF_BIT);

        ss.test = id;

        ss.nftToken[id] = LibSubscriptions.NFTToken(
            _uri,
            block.timestamp,
            baseTokenId,
            1,
            ss.baseToken[baseTokenId].creator
        );

        // Amounts = baseToken.nonce is going to mint extra nfts for burnt sub tokens but thats ok for now.
        LibERC1155._mint(
            ss.baseToken[baseTokenId].creator,
            id,
            ss.baseToken[baseTokenId].nonce,
            bytes("")
        );

        ss.tokenNonce = ss.tokenNonce.add(1);
    }

    function mintNFTtoSubscribersBatch(
        uint256[] memory baseTokenId,
        string memory _uri,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();
        address creator = ss.baseToken[baseTokenId[0]].creator;

        LibERC1155.verifySignature(creator, "nft", v, r, s);

        uint256[] memory ids = new uint256[](baseTokenId.length);
        uint256[] memory amounts = new uint256[](baseTokenId.length);

        for (uint256 i; i < baseTokenId.length; i++) {
            require(
                ss.baseToken[baseTokenId[i]].creator == creator,
                "Qualla/Invalid Creator"
            );

            ids[i] = (ss.tokenNonce.add(1) << 128);
            ids[i] = (ids[i] | TYPE_NF_BIT);

            // same amounts comment as above
            amounts[i] = ss.baseToken[baseTokenId[i]].nonce;

            ss.nftToken[ids[i]] = LibSubscriptions.NFTToken(
                _uri,
                block.timestamp,
                baseTokenId[i],
                1,
                creator
            );

            ss.tokenNonce = ss.tokenNonce.add(1);
        }

        LibERC1155._mintBatch(
            ss.baseToken[baseTokenId[0]].creator,
            ids,
            amounts,
            bytes("")
        );
    }

    function claimNFT(
        address user,
        uint256 subTokenId,
        uint256 nftTokenId,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        LibERC1155.verifySignature(user, "claim", v, r, s);

        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        LibERC1155.ERC1155Storage storage erc1155 = LibERC1155.erc1155Storage();

        require(erc1155._balances[subTokenId][user] > 0, "Qualla/Invalid User");
        require(
            subTokenId & NONCE_MASK == ss.nftToken[nftTokenId].baseToken,
            "Qualla/Invalid Redeem"
        );
        require(
            //Subtoken must be minted before nft
            ss.subToken[subTokenId].mintStamp <
                ss.nftToken[nftTokenId].mintStamp,
            "Qualla/Invalid mintstamp"
        );
        require(
            ss.nftRedeemed[nftTokenId][subTokenId] == false,
            "Qualla/Already Redeemed"
        );

        uint256 id = nftTokenId | ss.nftToken[nftTokenId].nonce;

        LibERC1155._mint(user, id, 1, bytes(""));
        LibERC1155._burn(ss.nftToken[nftTokenId].creator, nftTokenId, 1);

        ss.nftRedeemed[nftTokenId][subTokenId] = true;
    }
}
