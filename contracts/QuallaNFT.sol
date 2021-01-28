//SPDX-License-Identifier: Unlicense
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./QuallaSubscription.sol";

contract QuallaNFT is QuallaSubscription {
    using SafeMath for uint256;

    constructor(string memory uri_, uint256 chainId_)
        QuallaSubscription(uri_, chainId_)
    {}

    struct nftStruct {
        string uriID;
        uint256 mintTime;
        uint256 baseToken;
        uint256 index;
        address creator;
    }

    nftStruct[] public nfts;

    // mapping(uint256 => string) nftToUriID;
    // mapping(uint256 => uint256) public baseNftMintTime;
    // mapping(uint256 => uint256) public baseNftToBaseToken;
    // mapping(uint256 => uint256) public baseNftToIndex;
    // mapping(uint256 => address) public baseNftToCreator;
    mapping(uint256 => uint256) public idToStructIndex;
    mapping(uint256 => mapping(uint256 => bool)) public redeemed;

    function mintNFTtoSubscribers(
        address creator,
        uint256 baseTokenId,
        string memory _uri,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        _verifySignature(creator, "nft", v, r, s);
        require(
            tokenIdToCreator[baseTokenId] == creator,
            "Qualla/Invalid Creator"
        );

        uint256 id = (tokenNonce << 128);
        id = (id | TYPE_NF_BIT);

        nfts.push(nftStruct(_uri, block.timestamp, baseTokenId, 1, creator));

        idToStructIndex[id] = nfts.length - 1;

        // nftToUriID[id] = _uri;

        // baseNftMintTime[id] = block.timestamp;
        // baseNftToBaseToken[id] = baseTokenId;
        // baseNftToIndex[id] = 1;
        // baseNftToCreator[id] = creator;

        // Amounts = tokenIdToNextIndex is going to mint extra nfts for burnt sub tokens but thats ok.
        _mint(creator, id, tokenIdToNextIndex[baseTokenId], bytes(""));

        tokenNonce++;
    }

    function mintNFTtoSubscribersBatch(
        address creator,
        uint256[] memory baseTokenId,
        string memory _uri,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        _verifySignature(creator, "nft", v, r, s);

        uint256[] memory ids = new uint256[](baseTokenId.length);
        uint256[] memory amounts = new uint256[](baseTokenId.length);

        uint256 id;

        for (uint256 i = 0; i < baseTokenId.length; i++) {
            require(
                tokenIdToCreator[baseTokenId[i]] == creator,
                "Qualla/Invalid Creator"
            );

            id = (tokenNonce << 128);
            id = (id | TYPE_NF_BIT);

            nfts.push(
                nftStruct(_uri, block.timestamp, baseTokenId[i], 1, creator)
            );

            idToStructIndex[id] = nfts.length - 1;

            // nftToUriID[id] = _uri;

            // baseNftMintTime[id] = block.timestamp;
            // baseNftToBaseToken[id] = baseTokenId[i];
            // baseNftToIndex[id] = 1;
            // baseNftToCreator[id] = creator;

            ids[i] = id;
            amounts[i] = tokenIdToNextIndex[baseTokenId[i]];

            tokenNonce++;
        }

        _mintBatch(creator, ids, amounts, bytes(""));
    }

    function claimNFT(
        address user,
        uint256 subTokenId,
        uint256 nftTokenId,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        _verifySignature(user, "redeem", v, r, s);

        // console.log(subTokenId & NF_INDEX_MASK);

        require(
            subTokenId & NONCE_MASK ==
                nfts[idToStructIndex[nftTokenId]].baseToken,
            "Qualla/Invalid Redeem"
        );
        require(
            redeemed[nftTokenId][subTokenId] == false,
            "Qualla/Already Redeemed"
        );

        uint256 id = nftTokenId | nfts[idToStructIndex[nftTokenId]].index;

        // uint256 id = nftTokenId | baseNftToIndex[nftTokenId];

        _mint(user, id, 1, bytes(""));
        _burn(nfts[idToStructIndex[nftTokenId]].creator, nftTokenId, 1);

        redeemed[nftTokenId][subTokenId] = true;

        nfts[idToStructIndex[nftTokenId]].index++;
    }

    function uriID(uint256 id) external view returns (string memory) {
        return nfts[idToStructIndex[id & NONCE_MASK]].uriID;
    }
}
