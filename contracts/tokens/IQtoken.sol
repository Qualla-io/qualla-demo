// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

interface IQtoken {
    event Settle(address indexed account, int256 amount);

    // --- Read Functions -------------------------

    function realtimeBalanceOf(address account, uint256 timestamp)
        external
        view
        returns (int256 availableBalance, uint256 deposit);

    function getUnderlyingToken() external view returns (address);

    function isAccoundCritical(address account, uint256 timestamp)
        external
        view
        returns (bool critical);

    function isAccountLiquid(address account, uint256 timestamp)
        external
        view
        returns (bool liquid);

    // --- Write Functions ------------------------

    /**
    @dev Mints tokens for demo purposes. Should follow same process as upgrading tokens
    */
    function demoMint(address account, uint256 amount) external;

    function upgrade(uint256 amount) external;

    function operatorUpgrade(address account, uint256 amount) external;

    function downgrade(uint256 amount) external;

    function operatorDowngrade(address account, uint256 amount) external;

    function settleBalance(address account, int256 amount) external;
}
