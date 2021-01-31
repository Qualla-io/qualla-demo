// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "./ERC20.sol";

contract Qtoken is ERC20 {
    IERC20 internal _underlyingToken;

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
    }
}
