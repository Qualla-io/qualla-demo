// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "./IQtoken.sol";

import "./ERC20.sol";

contract Qtoken is ERC20, IQtoken {
    IERC20 internal _underlyingToken;

    address internal _defaultOperator;

    constructor() {}

    struct ActiveBeams {
        address reciepient;
        address sender;
        uint256 flowRate;
        uint256 beamID;
    }

    function initialize(
        IERC20 underlyingToken_,
        uint8 decimals_,
        string memory name_,
        string memory symbol_
    ) external initializer {
        _underlyingToken = underlyingToken_;
        _decimals = decimals_;
        _name = name_;
        _symbol = symbol_;

        // Set msg.sender as default operator
        _defaultOperator = msg.sender;
    }

    // --- Read Functions -------------------------

    function realtimeBalanceOf(address account, uint256 timestamp)
        public
        view
        override
    {}

    function getUnderlyingToken() external view override returns (address) {
        return address(_underlyingToken);
    }

    // --- Write Functions ------------------------
    function demoMint(address account, uint256 amount)
        external
        override
        onlyOperator
    {
        _mint(account, amount);
    }

    function upgrade(uint256 amount) external override {
        _upgrade(msg.sender, amount);
    }

    function operatorUpgrade(address account, uint256 amount)
        external
        override
        onlyOperator
    {
        _upgrade(account, amount);
    }

    function downgrade(uint256 amount) external override {
        _downgrade(msg.sender, amount);
    }

    function operatorDowngrade(address account, uint256 amount)
        external
        override
        onlyOperator
    {
        _downgrade(account, amount);
    }

    // --- Internal Functions ---------------------

    function _upgrade(address account, uint256 amount) internal {
        // transfer from user to this
        _underlyingToken.transferFrom(account, address(this), amount);

        // mint wrapped tokens
        _mint(account, amount);
    }

    function _downgrade(address account, uint256 amount) internal {
        // transfer from this to user
        _underlyingToken.transfer(account, amount);

        // burn wrapped tokens
        _burn(account, amount);
    }

    // --- Modifier Functions ---------------------

    modifier onlyOperator() {
        require(msg.sender == _defaultOperator);
        _;
    }
}
