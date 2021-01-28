//SPDX-License-Identifier: Unlicense
pragma solidity >=0.6.0 <0.8.0;

library QuallaLib {
    function _verifySignature(
        address user,
        uint256 userNonce,
        string memory action,
        uint8 v,
        bytes32 r,
        bytes32 s,
        bytes32 DOMAIN_SEPARATOR,
        bytes32 USER_TYPEHASH
    ) internal {
        bytes32 digest =
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    DOMAIN_SEPARATOR,
                    keccak256(
                        abi.encode(
                            USER_TYPEHASH,
                            user,
                            userNonce,
                            keccak256(bytes(action))
                        )
                    )
                )
            );

        require(user == ecrecover(digest, v, r, s), "Qualla/invalid-permit");
    }
}
