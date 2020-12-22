//SPDX-License-Identifier: Unlicense
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ERC1155.sol";

import "hardhat/console.sol";

contract SubscriptionV1 is Context, ERC1155 {
    using SafeMath for uint256;

    // Convention:
    // id = base id of token, has index of 0
    // id_ = instance id of token, has index of 1+

    uint256 fee = 5; // Percent

    uint256 public tokenNonce = 1;

    uint256 constant NONCE_MASK = uint256(uint128(~0)) << 128;
    uint256 constant NF_INDEX_MASK = uint128(~0);
    uint256 constant TYPE_NF_BIT = 1 << 255;

    // // how to add mask
    // id = (id | NF_INDEX_MASK);

    // // how to undo mask
    // id = ~(~id | NF_INDEX_MASK);

    // --- EIP712 niceties ---
    bytes32 public DOMAIN_SEPARATOR;
    bytes32 public constant USER_TYPEHASH =
        keccak256("User(address user,uint256 nonce,string action)");
    string public constant name = "Qualla Subscription";
    string public constant version = "1";
    uint256 public chainId = 31337;

    // --- ERC1155 niceties ---
    bytes4 private constant _INTERFACE_ID_ERC1155 = 0xd9b67a26;
    bytes4 private constant _INTERFACE_ID_ERC1155_METADATA_URI = 0x0e89341c;

    mapping(uint256 => uint256) public tokenIdToPaymentValue;
    mapping(uint256 => address) public tokenIdToPaymentToken;
    mapping(uint256 => uint256) public tokenId_ToNextWithdraw;
    mapping(uint256 => uint256) public tokenIdToNextIndex;
    mapping(uint256 => address) public tokenIdToCreator;
    mapping(address => uint256) public userNonce;

    event NFTevent(uint256 id);

    constructor() ERC1155("URI") {
        // register the supported interfaces to conform to ERC1155 via ERC165
        _registerInterface(_INTERFACE_ID_ERC1155);

        // register the supported interfaces to conform to ERC1155MetadataURI via ERC165
        _registerInterface(_INTERFACE_ID_ERC1155_METADATA_URI);

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes(name)),
                keccak256(bytes(version)),
                chainId,
                address(this)
            )
        );
    }

    function mintNFT() public {
        // verify signature

        uint256 id = (tokenNonce << 128);
        id = (id | NF_INDEX_MASK);
        ERC1155._mint(msg.sender, id, 1, bytes(""));

        // Do something with data

        tokenNonce++;
    }

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
        ERC1155._burn(creator, id, amount);
    }

    function mintSubscription(
        address creator,
        uint256 amount,
        uint8 v,
        bytes32 r,
        bytes32 s,
        bytes memory data
    ) public {
        // verify signature
        _verifySignature(creator, "mint", v, r, s);

        if (amount == 0) {
            amount = uint256(-1);
        }

        uint256 id = (tokenNonce << 128);

        _pushTokenData(
            ERC1155._asSingletonArray(id),
            creator,
            ERC1155._asSingletonArray(amount),
            data
        );

        ERC1155._mint(creator, id, amount, data);

        tokenNonce++;

        tokenIdToNextIndex[id] = 1;
    }

    function mintBatchSubscription(
        address creator,
        uint256[] memory amounts,
        uint8 v,
        bytes32 r,
        bytes32 s,
        bytes memory data
    ) public {
        _verifySignature(creator, "mint", v, r, s);

        uint256[] memory ids = new uint256[](amounts.length);

        for (uint256 i = 0; i < amounts.length; i++) {
            if (amounts[i] == 0) {
                amounts[i] = uint256(-1);
            }

            ids[i] = (tokenNonce << 128);

            tokenNonce++;

            tokenIdToNextIndex[ids[i]] = 1;
        }

        _pushTokenData(ids, creator, amounts, data);

        ERC1155._mintBatch(creator, ids, amounts, data);
    }

    function buySubscription(
        address subscriber,
        uint256 id,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        require(id & TYPE_NF_BIT == 0, "Qualla/Wrong-Token-Type");
        require(id & NF_INDEX_MASK == 0, "Qualla/Invalid-Subscription-Index");

        _verifySignature(subscriber, "subscribe", v, r, s);

        uint256 index = tokenIdToNextIndex[id];

        uint256 id_ = id | index;

        ERC1155._burn(tokenIdToCreator[id], id, 1);
        ERC1155._mint(subscriber, id_, 1, bytes(""));

        tokenIdToNextIndex[id]++;

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

        uint256 id = id_ & NONCE_MASK;
        ERC1155._burn(subscriber, id_, 1);
        ERC1155._mint(tokenIdToCreator[id], id, 1, bytes(""));
    }

    function getBaseIdFromToken(uint256 id_)
        external
        pure
        returns (uint256 id)
    {
        require(id_ & TYPE_NF_BIT == 0, "Qualla/Wrong-Token-Type");
        require(id_ & NF_INDEX_MASK > 0, "Qualla/Invalid-Subscription-Index");

        return id_ & NONCE_MASK;
    }

    function executeSubscription(uint256 id_, address subscriber) public {
        require(id_ & TYPE_NF_BIT == 0, "Qualla/Wrong-Token-Type");
        require(id_ & NF_INDEX_MASK > 0, "Qualla/Invalid-Subscription-Index");
        require(
            ERC1155._balances[id_][subscriber] == 1,
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

        // require(ERC20(paymentToken).allowance(subscriber, address(this))>paymentValue, "Qualla/");

        uint256 creatorCut = 100 - fee;

        // _transfer tokens
        try
            ERC20(paymentToken).transferFrom(
                subscriber,
                creator,
                paymentValue.mul(creatorCut).div(100)
            )
        returns (bool) {} catch {
            // if funds transfer fails, burn token
            ERC1155._burn(subscriber, id_, 1);
            ERC1155._mint(creator, id, 1, bytes(""));

            return;
        }

        try
            ERC20(paymentToken).transferFrom(
                subscriber,
                address(this), // Change this to contract owner
                paymentValue.mul(fee).div(100)
            )
        returns (bool) {} catch {
            // if funds transfer fails, burn token
            ERC1155._burn(subscriber, id_, 1);
            ERC1155._mint(creator, id, 1, bytes(""));

            return;
        }

        // add month in seconds
        tokenId_ToNextWithdraw[id_] += 2592000;
    }

    // untested
    function updateSubscriptionCreator(
        address newCreator,
        uint256 id,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(id & TYPE_NF_BIT == 0, "Qualla/Wrong-Token-Type");
        require(id & NF_INDEX_MASK == 0, "Qualla/Invalid-Subscription-Index");

        address oldCreator = tokenIdToCreator[id];

        _verifySignature(oldCreator, "update", v, r, s);

        ERC1155.safeTransferFrom(
            oldCreator,
            newCreator,
            id,
            ERC1155._balances[id][oldCreator],
            bytes("")
        );

        tokenIdToCreator[id] = newCreator;
    }

    function _pushTokenData(
        uint256[] memory id,
        address creator,
        uint256[] memory amounts, // Dont think I need this anymore
        bytes memory data
    ) internal {
        // Need to find the packing limit for data. Then revert if id.length is longer than that
        // Also might hit a gas limit

        address[] memory paymentToken = new address[](id.length);
        uint256[] memory paymentValue = new uint256[](id.length);

        // need to be careful with this. I dont think there is a good way to require the same length of data[] and id[]
        (paymentToken, paymentValue) = abi.decode(data, (address[], uint256[]));

        for (uint256 i = 0; i < id.length; i++) {
            tokenIdToPaymentValue[id[i]] = paymentValue[i];
            tokenIdToPaymentToken[id[i]] = paymentToken[i];
            tokenIdToCreator[id[i]] = creator;
        }
    }

    function _verifySignature(
        address user,
        string memory action,
        uint8 v,
        bytes32 r,
        bytes32 s
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
                            userNonce[user],
                            keccak256(bytes(action))
                        )
                    )
                )
            );

        require(user == ecrecover(digest, v, r, s), "Qualla/invalid-permit");
        userNonce[user]++;
    }
}
