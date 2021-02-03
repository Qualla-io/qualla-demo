// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "../libraries/LibAppStorage.sol";

interface IBeamTokenFacet {
    // --- Read Functions -------------------------

    function realtimeBalanceOf(
        IQtoken token,
        address account,
        uint256 timestamp
    ) external view returns (int256 dynamicBal, uint256 deposit);

    function getBeamToken(uint256 id) external view returns (BeamToken memory);

    function getTierIdFromBeamToken(uint256 id_)
        external
        pure
        returns (uint256 id);

    // --- Write Functions ------------------------

    function mintBeam(
        address subscriber,
        uint256 id,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function unSubscribe(
        address subscriber,
        uint256 id_,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    // --- Events ---------------------------------

    event FlowUpdated(
        address indexed account,
        address indexed token,
        int256 netFlow,
        uint256 netDeposit,
        uint256 timestamp
    );

    event BeamTransfer(
        address indexed to,
        address indexed from,
        uint256 id,
        uint256 tierId,
        uint256 flowRate,
        uint256 deposit,
        uint256 timestamp
    );
}
