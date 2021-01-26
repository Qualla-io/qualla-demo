//SPDX-License-Identifier: Unlicense
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./QuallaNFT.sol";

contract Qualla is QuallaNFT {
    using SafeMath for uint256;

    constructor(string memory uri_, uint256 chainId_)
        QuallaNFT(uri_, chainId_)
    {}

    // Place holder for future top level functions
}
