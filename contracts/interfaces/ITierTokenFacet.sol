// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "../libraries/LibAppStorage.sol";

interface ITierTokenFacet {
    // --- Events ---------------------------------
    event TierTransfer(
        address indexed to,
        address indexed from,
        address indexed paymentToken,
        uint256 id,
        uint256 flowRate,
        uint256 amount
    );

    event BatchTierTransfer(
        address indexed to,
        address indexed from,
        address[] paymentTokens,
        uint256[] ids,
        uint256[] flowRates,
        uint256[] amounts
    );

    // --- Read Functions -------------------------

    function getTierToken(uint256 id) external view returns (TierToken memory);

    // --- Write Functions ------------------------

    function mintTier(
        address creator,
        uint256 amount,
        address paymentToken,
        uint256 flowRate,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function mintBatchTier(
        address creator,
        uint256[] memory amounts,
        address[] calldata paymentTokens,
        uint256[] calldata flowRates,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function burnTier(
        uint256 id,
        uint256 amount,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}
