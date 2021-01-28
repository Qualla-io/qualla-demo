//SPDX-License-Identifier: Unlicense
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./QuallaBase.sol";

contract QuallaSubscription is QuallaBase {
    using SafeMath for uint256;

    constructor(string memory uri_, uint256 chainId_)
        QuallaBase(uri_, chainId_)
    {}

    // Mappings

    // BaseToken
    // This kinda blew up. Not sure if I should change to struct
    mapping(uint256 => uint256) public tokenIdToPaymentValue;
    mapping(uint256 => address) public tokenIdToPaymentToken;
    mapping(uint256 => uint256) public tokenIdToNextIndex;
    mapping(uint256 => address) public tokenIdToCreator;

    // SubToken
    mapping(uint256 => uint256) public tokenId_ToNextWithdraw;
    mapping(uint256 => uint256) public tokenId_ToMintStamp;

    // Just for demo purposes. Only allowing 5 executions before burning
    mapping(uint256 => uint256) public tokenId_ToExectuedNonce;

    // Public Functions

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
        // verify signature
        _verifySignature(creator, "mint", v, r, s);

        // TODO: Require paymentToken be ERC20

        if (amount == 0) {
            amount = uint256(-1);
        }

        uint256 id = (tokenNonce << 128);

        _pushTokenData(
            _asSingletonArray(id),
            creator,
            _asSingletonAddressArray(paymentToken),
            _asSingletonArray(paymentValue)
        );

        _mint(creator, id, amount, "");

        tokenNonce++;

        tokenIdToNextIndex[id] = 1;
    }

    function mintBatchSubscription(
        address creator,
        uint256[] memory amounts,
        address[] memory paymentTokens,
        uint256[] memory paymentValues,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        _verifySignature(creator, "mint", v, r, s);

        // TODO: Require paymentTokens be ERC20

        uint256[] memory ids = new uint256[](amounts.length);

        for (uint256 i = 0; i < amounts.length; i++) {
            if (amounts[i] == 0) {
                amounts[i] = uint256(-1);
            }

            ids[i] = (tokenNonce << 128);

            tokenNonce++;

            tokenIdToNextIndex[ids[i]] = 1;
        }

        _pushTokenData(ids, creator, paymentTokens, paymentValues);

        _mintBatch(creator, ids, amounts, "");
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

        address creator = tokenIdToCreator[id];

        _verifySignature(creator, "burn", v, r, s);
        _burn(creator, id, amount);
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

        require(
            IERC20(tokenIdToPaymentToken[id]).balanceOf(subscriber) >
                tokenIdToPaymentValue[id],
            "Qualla/Insufficient-Balance"
        );

        require(
            IERC20(tokenIdToPaymentToken[id]).allowance(
                subscriber,
                address(this)
            ) > tokenIdToPaymentValue[id],
            "Qualla/Insufficient-Allowance"
        );

        _verifySignature(subscriber, "subscribe", v, r, s);

        uint256 index = tokenIdToNextIndex[id];

        uint256 id_ = id | index;

        tokenId_ToMintStamp[id_] = block.timestamp;

        _burn(tokenIdToCreator[id], id, 1);
        _mint(subscriber, id_, 1, bytes(""));

        tokenIdToNextIndex[id]++;

        // TODO: Add option for immediate execution, rolling vs monthly execution, etc.
        executeSubscription(id_, subscriber);
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

        _verifySignature(subscriber, "unsubscribe", v, r, s);

        _burn(subscriber, id_, 1);
        _mint(tokenIdToCreator[id_ & NONCE_MASK], id_ & NONCE_MASK, 1, bytes(""));
    }

    function executeSubscription(uint256 id_, address subscriber) public {
        require(id_ & TYPE_NF_BIT == 0, "Qualla/Wrong-Token-Type");
        require(id_ & NF_INDEX_MASK > 0, "Qualla/Invalid-Subscription-Index");
        require(
            _balances[id_][subscriber] == 1,
            "Qualla/Invalid-Subscriber"
        );
        require(
            tokenId_ToNextWithdraw[id_] < block.timestamp,
            "Qualla/Subscription-Not-Ready"
        );

        uint256 id = id_ & NONCE_MASK;
        address creator = tokenIdToCreator[id];
        address paymentToken = tokenIdToPaymentToken[id];
        uint256 paymentValue = tokenIdToPaymentValue[id];

        // only for demo purposes!
        // ------------------------------
        uint256 executedNonce = tokenId_ToExectuedNonce[id_];
        if (executedNonce >= 4) {
            _burn(subscriber, id_, 1);
            _mint(creator, id, 1, bytes(""));
        } else {
            tokenId_ToExectuedNonce[id_] += 1;
        }
        // ------------------------------

        uint256 creatorCut = 100 - fee;

        // burn token in not enough funds or allowance
        if (
            IERC20(tokenIdToPaymentToken[id]).allowance(
                subscriber,
                address(this)
            ) <
            tokenIdToPaymentValue[id] ||
            IERC20(tokenIdToPaymentToken[id]).balanceOf(subscriber) <
            tokenIdToPaymentValue[id]
        ) {
            _burn(subscriber, id_, 1);
            _mint(creator, id, 1, bytes(""));
        }

        // _transfer tokens

        IERC20(paymentToken).transferFrom(
            subscriber,
            master,
            paymentValue.mul(fee).div(100)
        );

        IERC20(paymentToken).transferFrom(
            subscriber,
            creator,
            paymentValue.mul(creatorCut).div(100)
        );

        // add month in seconds
        // tokenId_ToNextWithdraw[id_] += 2592000;

        // For demo purposes!
        tokenId_ToNextWithdraw[id_] += 15;
    }

    // untested
    // function updateSubscriptionCreator(
    //     address newCreator,
    //     uint256 id,
    //     uint8 v,
    //     bytes32 r,
    //     bytes32 s
    // ) external {
    //     require(id & TYPE_NF_BIT == 0, "Qualla/Wrong-Token-Type");
    //     require(id & NF_INDEX_MASK == 0, "Qualla/Invalid-Subscription-Index");

    //     address oldCreator = tokenIdToCreator[id];

    //     _verifySignature(oldCreator, "update", v, r, s);

    //     ERC1155.safeTransferFrom(
    //         oldCreator,
    //         newCreator,
    //         id,
    //         ERC1155._balances[id][oldCreator],
    //         bytes("")
    //     );

    //     tokenIdToCreator[id] = newCreator;
    // }

    // Internal Functions
    function _pushTokenData(
        uint256[] memory id,
        address creator,
        address[] memory paymentToken,
        uint256[] memory paymentValue
    ) internal {
        for (uint256 i = 0; i < id.length; i++) {
            tokenIdToPaymentValue[id[i]] = paymentValue[i];
            tokenIdToPaymentToken[id[i]] = paymentToken[i];
            tokenIdToCreator[id[i]] = creator;
        }
    }
}
