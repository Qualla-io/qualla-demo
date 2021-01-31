// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../tokens/IERC20.sol";

library LibSubscriptions {
    using SafeMath for uint256;

    // Dumping app storage in here for now. May split up later

    bytes32 constant DIAMOND_STORAGE_POSITION =
        keccak256("diamond.standard.subscriptions.storage");

    struct BaseToken {
        address creator;
        IERC20 paymentToken;
        uint256 paymentValue;
        uint256 nonce;
    }

    struct SubToken {
        uint256 nonce; // For demo purposes only
        uint256 nextWidthdraw;
        uint256 mintStamp;
    }

    struct NFTToken {
        string uri;
        uint256 mintStamp;
        uint256 baseToken;
        uint256 nonce;
        address creator;
    }

    struct SubscriptionStorage {
        mapping(uint256 => BaseToken) baseToken;
        mapping(uint256 => SubToken) subToken;
        mapping(uint256 => NFTToken) nftToken;
        mapping(uint256 => mapping(uint256 => bool)) nftRedeemed;
        mapping(IERC20 => address) ERC20toWrapper;
        IERC20[] wrappedTokens;
        uint256 tokenNonce;
        uint256 test;
    }

    function subscriptionStorage()
        internal
        pure
        returns (SubscriptionStorage storage ss)
    {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ss.slot := position
        }
    }
}
