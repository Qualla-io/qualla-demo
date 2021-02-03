// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "../tokens/IERC20.sol";
import "../tokens/ERC20Info.sol";
import "../tokens/IQtoken.sol";

interface ITokenFactoryFacet {
    event WrapperDeployed(
        address indexed qToken,
        address indexed token,
        string name,
        string symbol,
        uint8 decimals
    );

    function getTokenWrapper(IERC20 token) external view returns (address);

    function deployERC20Wrapper(
        IERC20 underlyingToken,
        uint8 underlyingDecimals,
        string calldata name,
        string calldata symbol
    ) external;

    function deployERC20WrapperInfo(
        ERC20Info underlyingToken,
        string calldata name,
        string calldata symbol
    ) external;

    function demoMintWrappedERC20(
        IQtoken underlyingToken,
        address account,
        uint256 amount
    ) external;
}
