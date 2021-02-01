// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../libraries/LibAppStorage.sol";
import "../tokens/IERC20.sol";

contract TokenManagementFacet is LibAppBase {
    struct TokenBalances {
        IERC20 token;
        uint256 balance;
    }

    function getAllBalances() external view returns (TokenBalances[] memory) {

        IERC20[] memory tokens = state.wrappedTokens;

        TokenBalances[] memory report = new TokenBalances[](tokens.length);

        for (uint256 i; i < tokens.length; i++) {
            report[i] = TokenBalances(
                tokens[i],
                tokens[i].balanceOf(address(this))
            );
        }

        return report;
    }
}
