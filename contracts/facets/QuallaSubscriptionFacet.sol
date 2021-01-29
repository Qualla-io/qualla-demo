// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;


import "@openzeppelin/contracts/math/SafeMath.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../libraries/LibSubscriptions.sol";
import "../libraries/LibERC1155.sol";

import "hardhat/console.sol";

contract QuallaSubscriptionsFacet {
    using SafeMath for uint256;

    uint256 constant NONCE_MASK = uint256(uint128(~0)) << 128;
    uint256 constant NF_INDEX_MASK = uint128(~0);
    uint256 constant TYPE_NF_BIT = 1 << 255;

    /***********************************|
   |             Read Functions         |
   |__________________________________*/

    function getBaseToken(uint256 id)
        external
        view
        returns (LibSubscriptions.BaseToken memory)
    {
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        LibSubscriptions.BaseToken memory res;

        res.creator = ss.baseToken[id].creator;
        res.paymentToken = ss.baseToken[id].paymentToken;
        res.paymentValue = ss.baseToken[id].paymentValue;
        res.nonce = ss.baseToken[id].nonce;

        return res;
    }

    function getSubToken(uint256 id)
        external
        view
        returns (LibSubscriptions.SubToken memory)
    {
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        LibSubscriptions.SubToken memory res;

        res.nonce = ss.subToken[id].nonce;
        res.nextWidthdraw = ss.subToken[id].nextWidthdraw;
        res.mintStamp = ss.subToken[id].mintStamp;

        return res;
    }

    // Maybe add a batch get?


    /***********************************|
   |             Write Functions        |
   |__________________________________*/

    

    // Minting
    function mintSubscription(
        address creator,
        uint256 amount,
        address paymentToken,
        uint256 paymentValue,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        LibERC1155.verifySignature(creator, "mint", v, r, s);

        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        if (amount == 0) {
            amount = uint256(-1);
        }

        uint256 id = (ss.tokenNonce.add(1) << 128);

        ss.baseToken[id] = LibSubscriptions.BaseToken(
            creator,
            IERC20(paymentToken),
            paymentValue,
            1
        );

        ss.tokenNonce = ss.tokenNonce.add(1);

        LibERC1155._mint(creator, id, amount, "");
    }

    function mintBatchSubscription(
        address creator,
        uint256[] memory amounts,
        address[] calldata paymentTokens,
        uint256[] calldata paymentValues,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        require(
            amounts.length == paymentTokens.length,
            "Qualla: amounts and paymentTokens length mismatch"
        );
        require(
            amounts.length == paymentValues.length,
            "ERC1155: amounts and paymentValues length mismatch"
        );
        LibERC1155.verifySignature(creator, "mint", v, r, s);

        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        uint256[] memory ids = new uint256[](amounts.length);

        for (uint256 i = 0; i < amounts.length; i++) {
            if (amounts[i] == 0) {
                amounts[i] = uint256(-1);
            }

            ids[i] = (ss.tokenNonce.add(1) << 128);

            ss.baseToken[ids[i]] = LibSubscriptions.BaseToken(
                creator,
                IERC20(paymentTokens[i]),
                paymentValues[i],
                1
            );

            ss.tokenNonce = ss.tokenNonce.add(1);
        }

        LibERC1155._mintBatch(creator, ids, amounts, "");
    }

    // Burning
    function burnSubscription(
        uint256 id,
        uint256 amount,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        require(id & TYPE_NF_BIT == 0, "Qualla/Wrong-Token-Type");
        require(id & NF_INDEX_MASK == 0, "Qualla/Invalid-Subscription-Index");

        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        address creator = ss.baseToken[id].creator;

        LibERC1155.verifySignature(creator, "burn", v, r, s);
        LibERC1155._burn(creator, id, amount);
    }

    // Subscription
    function buySubscription(
        address subscriber,
        uint256 id,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        require(id & TYPE_NF_BIT == 0, "Qualla/Wrong-Token-Type");
        require(id & NF_INDEX_MASK == 0, "Qualla/Invalid-Subscription-Index");

        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        LibSubscriptions.BaseToken memory _token = ss.baseToken[id];

        require(_token.creator != address(0), "Qualla/Invalid-Token-Id");

        require(
            _token.paymentToken.balanceOf(subscriber) > _token.paymentValue,
            "Qualla/Insufficient-Balance"
        );

        require(
            _token.paymentToken.allowance(subscriber, address(this)) >
                _token.paymentValue,
            "Qualla/Insufficient-Allowance"
        );

        LibERC1155.verifySignature(subscriber, "subscribe", v, r, s);

        uint256 id_ = id | _token.nonce;

        ss.subToken[id_] = LibSubscriptions.SubToken(0, 0, block.timestamp);

        LibERC1155._burn(_token.creator, id, 1);
        LibERC1155._mint(subscriber, id_, 1, bytes(""));

        ss.baseToken[id].nonce = ss.baseToken[id].nonce.add(1);

        // // TODO: Add option for immediate execution, rolling vs monthly execution, etc.
        // executeSubscription(id_, subscriber);
    }

    function unSubscribe(
        address subscriber,
        uint256 id_,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        require(id_ & TYPE_NF_BIT == 0, "Qualla/Wrong-Token-Type");
        require(id_ & NF_INDEX_MASK > 0, "Qualla/Invalid-Subscription-Index");

        LibERC1155.verifySignature(subscriber, "unsubscribe", v, r, s);

        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        LibERC1155._burn(subscriber, id_, 1);
        LibERC1155._mint(
            ss.baseToken[id_ & NONCE_MASK].creator,
            id_ & NONCE_MASK,
            1,
            bytes("")
        );
    }

    function executeSubscription(uint256 id_, address subscriber) public {
        require(id_ & TYPE_NF_BIT == 0, "Qualla/Wrong-Token-Type");
        require(id_ & NF_INDEX_MASK > 0, "Qualla/Invalid-Subscription-Index");

        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        LibERC1155.ERC1155Storage storage erc1155 = LibERC1155.erc1155Storage();

        require(
            erc1155._balances[id_][subscriber] == 1,
            "Qualla/Invalid-Subscriber"
        );
        require(
            ss.subToken[id_].nextWidthdraw < block.timestamp,
            "Qualla/Subscription-Not-Ready"
        );

        uint256 id = id_ & NONCE_MASK;

        LibSubscriptions.BaseToken memory _token = ss.baseToken[id];

        // only for demo purposes!
        // ------------------------------
        if (ss.subToken[id_].nonce >= 4) {
            LibERC1155._burn(subscriber, id_, 1);
            LibERC1155._mint(_token.creator, id, 1, bytes(""));
        } else {
            ss.subToken[id_].nonce = ss.subToken[id_].nonce.add(1);
        }
        // ------------------------------

        uint256 creatorCut = 100 - erc1155.fee;

        // burn token in not enough funds or allowance
        if (
            _token.paymentToken.allowance(subscriber, address(this)) <
            _token.paymentValue ||
            _token.paymentToken.balanceOf(subscriber) < _token.paymentValue
        ) {
            LibERC1155._burn(subscriber, id_, 1);
            LibERC1155._mint(_token.creator, id, 1, bytes(""));
        }

        // _transfer tokens

        // _token.paymentToken.transferFrom(
        //     subscriber,
        //     erc1155.feeCollector,
        //     _token.paymentValue.mul(erc1155.fee).div(100)
        // );

        _token.paymentToken.transferFrom(
            subscriber,
            _token.creator,
            _token.paymentValue.mul(creatorCut).div(100)
        );

        // add month in seconds
        // tokenId_ToNextWithdraw[id_] += 2592000;

        // For demo purposes!
        ss.subToken[id_].nextWidthdraw = ss.subToken[id_].nextWidthdraw.add(15);
    }

    
}
