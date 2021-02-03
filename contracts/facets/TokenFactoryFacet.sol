// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../libraries/LibAppStorage.sol";
import "../tokens/IERC20.sol";
import "../tokens/ERC20Info.sol";
import "../tokens/Qtoken.sol";

import "../interfaces/ITokenFactoryFacet.sol";

import "hardhat/console.sol";

contract TokenFactoryFacet is LibAppBase, ITokenFactoryFacet {
    using SafeMath for uint256;

    function getTokenWrapper(IERC20 token)
        public
        view
        override
        returns (address)
    {
        return state.ERC20toWrapper[token];
    }

    function deployERC20Wrapper(
        IERC20 underlyingToken,
        uint8 underlyingDecimals,
        string calldata name,
        string calldata symbol
    ) public override {
        require(address(underlyingToken) != address(0), "Qualla/zero-address");

        // Initialze new wrapper

        Qtoken token = new Qtoken();

        token.initialize(underlyingToken, underlyingDecimals, name, symbol);
        // = deploy wrapper

        state.ERC20toWrapper[underlyingToken] = address(token);
        state.isWrappedToken[address(token)] = true;
        state.wrappedTokens.push(underlyingToken);
        emit WrapperDeployed(
            address(token),
            address(underlyingToken),
            name,
            symbol,
            underlyingDecimals
        );
    }

    function deployERC20WrapperInfo(
        ERC20Info underlyingToken,
        string calldata name,
        string calldata symbol
    ) external override {
        deployERC20Wrapper(
            underlyingToken,
            underlyingToken.decimals(),
            name,
            symbol
        );
    }

    function demoMintWrappedERC20(
        IQtoken underlyingToken,
        address account,
        uint256 amount
    ) external override {
        underlyingToken.demoMint(account, amount);
    }
}
