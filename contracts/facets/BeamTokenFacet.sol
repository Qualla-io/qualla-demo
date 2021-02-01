// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../interfaces/IBeamTokenFacet.sol";

import "../libraries/LibAppStorage.sol";
import "../libraries/LibERC1155.sol";

contract BeamTokenFacet is IBeamTokenFacet, LibAppBase {
    using SafeMath for uint256;

    function getRealtimeBalance(uint256 beamTokenID, uint256 timestamp) public view {
        
    }

    function getUserBeams(address user)
        external
        view
        returns (BeamToken[] memory)
    {}

    function getBeamToken(uint256 id)
        external
        view
        override
        returns (BeamToken memory)
    {

        BeamToken memory res;

        res.mintStamp = state.beamToken[id].mintStamp;

        return res;
    }

    function getBaseIdFromBeamToken(uint256 id_)
        external
        pure
        override
        returns (uint256 id)
    {
        require(
            id_ & LibAppStorage.TYPE_NF_BIT == 0,
            "Qualla/Wrong-Token-Type"
        );
        require(
            id_ & LibAppStorage.NF_INDEX_MASK > 0,
            "Qualla/Invalid-Subscription-Index"
        );

        return id_ & LibAppStorage.NONCE_MASK;
    }

    // Subscription
    function mintBeam(
        address subscriber,
        uint256 id,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public override {
        require(
            id & LibAppStorage.TYPE_NF_BIT == 0,
            "Qualla/Wrong-Token-Type"
        );
        require(
            id & LibAppStorage.NF_INDEX_MASK == 0,
            "Qualla/Invalid-Subscription-Index"
        );

        BaseToken memory _token = state.baseToken[id];

        require(_token.creator != address(0), "Qualla/Invalid-Token-Id");

        // change this for beam tokens?
        // require(
        //     _token.paymentToken.balanceOf(subscriber) > _token.paymentValue,
        //     "Qualla/Insufficient-Balance"
        // );

        // require(
        //     _token.paymentToken.allowance(subscriber, address(this)) >
        //         _token.paymentValue,
        //     "Qualla/Insufficient-Allowance"
        // );

        LibERC1155.verifySignature(subscriber, "subscribe", v, r, s);

        uint256 id_ = id | _token.nonce;

        state.beamToken[id_] = BeamToken(block.timestamp);

        LibERC1155._burn(_token.creator, id, 1);
        LibERC1155._mint(subscriber, id_, 1, bytes(""));

        state.baseToken[id].nonce = state.baseToken[id].nonce.add(1);

        // // TODO: Add option for immediate execution, rolling vs monthly execution, etc.
        // executeSubscription(id_, subscriber);
    }

    function unSubscribe(
        address subscriber,
        uint256 id_,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public override {
        require(
            id_ & LibAppStorage.TYPE_NF_BIT == 0,
            "Qualla/Wrong-Token-Type"
        );
        require(
            id_ & LibAppStorage.NF_INDEX_MASK > 0,
            "Qualla/Invalid-Subscription-Index"
        );

        LibERC1155.ERC1155Storage storage erc1155 = LibERC1155.erc1155Storage();

        require(
            erc1155._balances[id_][subscriber] > 0,
            "Qualla/Invalid-Subscriber"
        );

        LibERC1155.verifySignature(subscriber, "unsubscribe", v, r, s);

        LibERC1155._burn(subscriber, id_, 1);
        LibERC1155._mint(
            state.baseToken[id_ & LibAppStorage.NONCE_MASK].creator,
            id_ & LibAppStorage.NONCE_MASK,
            1,
            bytes("")
        );
    }
}
