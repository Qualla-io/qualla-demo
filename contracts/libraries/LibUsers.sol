// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

library LibUsers {
    using SafeMath for uint256;

    bytes32 constant DIAMOND_STORAGE_POSITION =
        keccak256("diamond.standard.users.storage");

    struct User {
        uint256 nonce; // should probably move this to its own library
    }

    struct UserStorage {
        mapping(address => User) userProps;
    }

    function userStorage()
        internal
        pure
        returns (UserStorage storage us)
    {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            us.slot := position
        }
    }

    function incUserNonce(address _user) internal {
        UserStorage storage us = userStorage();
        us.userProps[_user].nonce = us.userProps[_user].nonce.add(1);
    }
}
