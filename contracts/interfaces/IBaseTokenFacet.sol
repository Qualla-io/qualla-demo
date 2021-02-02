// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "../libraries/LibAppStorage.sol";

interface IBaseTokenFacet {
    // --- Read Functions -------------------------

    function getBaseToken(uint256 id) external view returns (BaseToken memory);

    // --- Write Functions ------------------------

    function mintBase(
        address creator,
        uint256 amount,
        IQtoken paymentToken,
        uint256 flowRate,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function mintBatchBase(
        address creator,
        uint256[] memory amounts,
        IQtoken[] calldata paymentTokens,
        uint256[] calldata flowRates,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function burnBase(
        uint256 id,
        uint256 amount,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}
