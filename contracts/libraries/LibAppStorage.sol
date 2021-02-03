// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../tokens/IQtoken.sol";
import "../tokens/IERC20.sol";

struct TierToken {
    address creator;
    IQtoken paymentToken;
    uint256 flowRate;
    uint256 nonce;
    uint256 activeBeams;
}

// not sure if I need to keep all this data
struct BeamToken {
    address to;
    address from;
    uint256 flowRate;
    uint256 deposit;
    uint256 mintStamp;
    IQtoken paymentToken;
}

struct NFTToken {
    string uri;
    uint256 mintStamp;
    uint256 tierToken;
    uint256 nonce;
    address creator;
}

struct UserFlow {
    int256 netFlowRate;
    uint256 netDeposit;
    uint256 lastUpdated;
}

struct AppStorage {
    mapping(uint256 => TierToken) tierToken;
    mapping(uint256 => BeamToken) beamToken;
    mapping(address => BeamToken[]) userBeams; // This is the lazy way to do this. Should look into a more efficient way
    mapping(uint256 => NFTToken) nftToken;
    mapping(uint256 => mapping(uint256 => bool)) nftRedeemed;
    mapping(IERC20 => address) ERC20toWrapper;
    mapping(IQtoken => mapping(address => UserFlow)) userFlowData;
    mapping(address => bool) isWrappedToken;
    IERC20[] wrappedTokens;
    uint256 tokenNonce;
    uint256 test;
    uint256 liqPeriod;
}

library LibAppStorage {
    using SafeMath for uint256;

    // Dumping app storage in here for now. May split up later

    bytes32 constant DIAMOND_STORAGE_POSITION =
        keccak256("diamond.standard.application.storage");

    uint256 constant NONCE_MASK = uint256(uint128(~0)) << 128;
    uint256 constant NF_INDEX_MASK = uint128(~0);
    uint256 constant TYPE_NF_BIT = 1 << 255;

    function subscriptionStorage()
        internal
        pure
        returns (AppStorage storage state)
    {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            state.slot := 0
        }
    }
}

contract LibAppBase {
    AppStorage internal state;
}
