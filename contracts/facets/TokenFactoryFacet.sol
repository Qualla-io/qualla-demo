// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../libraries/LibSubscriptions.sol";
import "../tokens/IERC20.sol";
import "../tokens/ERC20Info.sol";
import "../tokens/Qtoken.sol";

import "hardhat/console.sol";

contract TokenFactoryFacet {
    using SafeMath for uint256;

    event WrapperDeployed(address indexed qToken, address indexed token);

    function getTokenWrapper(IERC20 token) public view returns (address) {
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        return ss.ERC20toWrapper[token];
    }

    function deployERC20Wrapper(
        IERC20 underlyingToken,
        uint8 underlyingDecimals,
        string calldata name,
        string calldata symbol
    ) public {
        require(address(underlyingToken) != address(0), "Qualla/zero-address");

        // Initialze new wrapper

        // store mapping
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        Qtoken token = new Qtoken();

        token.initialize(underlyingToken, underlyingDecimals, name, symbol);
        // = deploy wrapper

        ss.ERC20toWrapper[underlyingToken] = address(token);
        ss.wrappedTokens.push(underlyingToken);
        emit WrapperDeployed(address(token), address(underlyingToken));
    }

    function deployERC20WrapperInfo(
        ERC20Info underlyingToken,
        string calldata name,
        string calldata symbol
    ) external {
        deployERC20Wrapper(
            underlyingToken,
            underlyingToken.decimals(),
            name,
            symbol
        );
    }
}
