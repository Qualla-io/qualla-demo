// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "../interfaces/IBaseTokenFacet.sol";

import "../libraries/LibAppStorage.sol";
import "../libraries/LibERC1155.sol";
import "../tokens/IERC20.sol";

import "hardhat/console.sol";

contract BaseTokenFacet is IBaseTokenFacet, LibAppBase {
    using SafeMath for uint256;

    /***********************************|
   |             Read Functions         |
   |__________________________________*/

    function getBaseToken(uint256 id)
        external
        view
        override
        returns (BaseToken memory)
    {

        BaseToken memory res;

        res.creator = state.baseToken[id].creator;
        res.paymentToken = state.baseToken[id].paymentToken;
        res.flowRate = state.baseToken[id].flowRate;
        res.nonce = state.baseToken[id].nonce;
        res.activeBeams = state.baseToken[id].activeBeams;

        return res;
    }

    // Maybe add a batch get?

    /***********************************|
   |             Write Functions        |
   |__________________________________*/

    // Minting
    function mintBase(
        address creator,
        uint256 amount,
        IERC20 paymentToken,
        uint256 flowRate,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public override {
        LibERC1155.verifySignature(creator, "mint", v, r, s);

        require(
            state.ERC20toWrapper[paymentToken] != address(0),
            "Qualla/Invalid-paymentToken"
        );

        if (amount == 0) {
            amount = uint256(-1);
        }

        uint256 id = (state.tokenNonce.add(1) << 128);

        state.baseToken[id] = BaseToken(
            creator,
            IERC20(paymentToken),
            flowRate,
            1, // nonce
            0 // activeBeams
        );

        state.tokenNonce = state.tokenNonce.add(1);

        LibERC1155._mint(creator, id, amount, "");
    }

    function mintBatchBase(
        address creator,
        uint256[] memory amounts,
        IERC20[] calldata paymentTokens,
        uint256[] calldata flowRates,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public override {
        require(
            amounts.length == paymentTokens.length,
            "Qualla: amounts and paymentTokens length mismatch"
        );
        require(
            amounts.length == flowRates.length,
            "ERC1155: amounts and paymentValues length mismatch"
        );
        LibERC1155.verifySignature(creator, "mint", v, r, s);

        uint256[] memory ids = new uint256[](amounts.length);

        for (uint256 i = 0; i < amounts.length; i++) {
            require(
                state.ERC20toWrapper[paymentTokens[i]] != address(0),
                "Qualla/Invalid-paymentToken"
            );

            if (amounts[i] == 0) {
                amounts[i] = uint256(-1);
            }

            ids[i] = (state.tokenNonce.add(1) << 128);

            state.baseToken[ids[i]] = BaseToken(
                creator,
                IERC20(paymentTokens[i]), // should this be the wrapped token instead?
                flowRates[i],
                1, // nonce
                0 // activeBeams
            );

            state.tokenNonce = state.tokenNonce.add(1);
        }

        LibERC1155._mintBatch(creator, ids, amounts, "");
    }

    // Burning
    function burnBase(
        uint256 id,
        uint256 amount,
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

        address creator = state.baseToken[id].creator;

        LibERC1155.verifySignature(creator, "burn", v, r, s);
        LibERC1155._burn(creator, id, amount);
    }

    // function executeSubscription(uint256 id_, address subscriber) public {
    //     require(id_ & TYPE_NF_BIT == 0, "Qualla/Wrong-Token-Type");
    //     require(id_ & NF_INDEX_MASK > 0, "Qualla/Invalid-Subscription-Index");


    //     LibERC1155.ERC1155Storage storage erc1155 = LibERC1155.erc1155Storage();

    //     require(
    //         erc1155._balances[id_][subscriber] == 1,
    //         "Qualla/Invalid-Subscriber"
    //     );
    //     require(
    //         state.subToken[id_].nextWidthdraw < block.timestamp,
    //         "Qualla/Subscription-Not-Ready"
    //     );

    //     uint256 id = id_ & NONCE_MASK;

    //     LibAppStorage.BaseToken memory _token = state.baseToken[id];

    //     // only for demo purposes!
    //     // ------------------------------
    //     if (ss.subToken[id_].nonce >= 4) {
    //         LibERC1155._burn(subscriber, id_, 1);
    //         LibERC1155._mint(_token.creator, id, 1, bytes(""));
    //     } else {
    //         state.subToken[id_].nonce = state.subToken[id_].nonce.add(1);
    //     }
    //     // ------------------------------

    //     uint256 creatorCut = 100 - erc1155.fee;

    //     // burn token in not enough funds or allowance
    //     if (
    //         _token.paymentToken.allowance(subscriber, address(this)) <
    //         _token.paymentValue ||
    //         _token.paymentToken.balanceOf(subscriber) < _token.paymentValue
    //     ) {
    //         LibERC1155._burn(subscriber, id_, 1);
    //         LibERC1155._mint(_token.creator, id, 1, bytes(""));
    //     }

    //     // _transfer tokens

    //     // _token.paymentToken.transferFrom(
    //     //     subscriber,
    //     //     erc1155.feeCollector,
    //     //     _token.paymentValue.mul(erc1155.fee).div(100)
    //     // );

    //     _token.paymentToken.transferFrom(
    //         subscriber,
    //         _token.creator,
    //         _token.paymentValue.mul(creatorCut).div(100)
    //     );

    //     // add month in seconds
    //     // tokenId_ToNextWithdraw[id_] += 2592000;

    //     // For demo purposes!
    //     state.subToken[id_].nextWidthdraw = state.subToken[id_].nextWidthdraw.add(15);

    //     // Add event here
    // }
}
