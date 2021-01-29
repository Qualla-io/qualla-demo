// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

library LibSubscriptions {
    bytes32 constant DIAMOND_STORAGE_POSITION =
        keccak256("diamond.standard.subscriptions.storage");

    struct BaseToken {
        address creator;
        address paymentToken;
        uint256 paymentValue;
        uint256 nonce;
    }

    struct SubToken {
        uint256 nonce; // For demo purposes only
        uint256 nextWidthdraw;
        uint256 mintStamp;
    }

    struct SubscriptionStorage {
        mapping(uint256 => BaseToken) baseToken;
        mapping(uint256 => SubToken) subToken;
        mapping(uint256 => mapping(address => uint256)) _balances;
        mapping(address => mapping(address => bool)) _operatorApprovals;
        uint256 tokenNonce;
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
