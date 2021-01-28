//SPDX-License-Identifier: Unlicense
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./QuallaStorage.sol";
import "./QuallaLib.sol";
import "./ERC1155.sol";

import "hardhat/console.sol";

contract QuallaSubscription is ERC1155, Ownable {
    using SafeMath for uint256;
    using QuallaLib for address;

    QuallaStorage quallaStorage;

    bytes4 private constant _INTERFACE_ID_ERC1155 = 0xd9b67a26;
    bytes32 public constant USER_TYPEHASH =
        keccak256("User(address user,uint256 nonce,string action)");
    bytes32 public DOMAIN_SEPARATOR;

    uint256 constant NONCE_MASK = uint256(uint128(~0)) << 128;
    uint256 constant NF_INDEX_MASK = uint128(~0);
    uint256 constant TYPE_NF_BIT = 1 << 255;

    constructor(address _quallaStorage) ERC1155("_") {
        _registerInterface(_INTERFACE_ID_ERC1155);

        quallaStorage = QuallaStorage(_quallaStorage);

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("Qualla Subscription")), //name
                keccak256(bytes("1")), // version
                quallaStorage.getUint(keccak256("chainId")), // chainId
                address(this)
            )
        );
    }

    function mintSubscription(
        address creator,
        uint256 amount,
        address paymentToken,
        uint256 paymentValue,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        creator._verifySignature(
            quallaStorage.getUint(keccak256(abi.encode("user.nonce", creator))),
            "mint",
            v,
            r,
            s,
            DOMAIN_SEPARATOR,
            USER_TYPEHASH
        );

        if (amount == 0) {
            amount = uint256(-1);
        }

        uint256 id =
            (quallaStorage.getUint(keccak256(abi.encode("tokenNonce"))) << 128);

        quallaStorage.setUint(keccak256(abi.encode("token.nonce", id)), 1);
        quallaStorage.setUint(
            keccak256(abi.encode("token.paymentValue", id)),
            paymentValue
        );
        quallaStorage.setAddress(
            keccak256(abi.encode("token.creator", id)),
            creator
        );
        quallaStorage.setAddress(
            keccak256(abi.encode("token.paymentToken", id)),
            paymentToken
        );

        _mint(creator, id, amount, "");

        incUserNonce(creator);
        incTokenNonce(1);
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
        creator._verifySignature(
            quallaStorage.getUint(keccak256(abi.encode("user.nonce", creator))),
            "mint",
            v,
            r,
            s,
            DOMAIN_SEPARATOR,
            USER_TYPEHASH
        );

        uint256[] memory ids = new uint256[](amounts.length);
        uint256 tokenNonce =
            quallaStorage.getUint(keccak256(abi.encode("tokenNonce")));
        uint256 i;
        for (i = 0; i < amounts.length; i++) {
            if (amounts[i] == 0) {
                amounts[i] = uint256(-1);
            }

            ids[i] = (tokenNonce << 128);

            quallaStorage.setUint(
                keccak256(abi.encode("token.nonce", ids[i])),
                1
            );
            quallaStorage.setUint(
                keccak256(abi.encode("token.paymentValue", ids[i])),
                paymentValues[i]
            );
            quallaStorage.setAddress(
                keccak256(abi.encode("token.creator", ids[i])),
                creator
            );
            quallaStorage.setAddress(
                keccak256(abi.encode("token.paymentToken", ids[i])),
                paymentTokens[i]
            );

            tokenNonce++;
        }

        console.log(i); // test this

        _mintBatch(creator, ids, amounts, "");
        incUserNonce(creator);
        incTokenNonce(i);
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

        require(
            IERC20(
                quallaStorage.getAddress(
                    keccak256(abi.encode("token.paymentToken", id))
                )
            )
                .balanceOf(subscriber) >
                quallaStorage.getUint(
                    keccak256(abi.encode("token.paymentValue", id))
                ),
            "Qualla/Insufficient-Balance"
        );

        require(
            IERC20(
                quallaStorage.getAddress(
                    keccak256(abi.encode("token.paymentToken", id))
                )
            )
                .allowance(subscriber, address(this)) >
                quallaStorage.getUint(
                    keccak256(abi.encode("token.paymentValue", id))
                ),
            "Qualla/Insufficient-Allowance"
        );

        subscriber._verifySignature(
            quallaStorage.getUint(
                keccak256(abi.encode("user.nonce", subscriber))
            ),
            "subscribe",
            v,
            r,
            s,
            DOMAIN_SEPARATOR,
            USER_TYPEHASH
        );

        uint256 id_ =
            id |
                quallaStorage.getUint(keccak256(abi.encode("token.nonce", id)));

        quallaStorage.setUint(
            keccak256(abi.encode("token.mintStamp", id_)),
            block.timestamp
        );

        _burn(
            quallaStorage.getAddress(
                keccak256(abi.encode("token.creator", id))
            ),
            id,
            1
        );
        _mint(subscriber, id_, 1, bytes(""));

        incTokenIndex(id);
        incUserNonce(subscriber);

        // TODO: Add option for immediate execution, rolling vs monthly execution, etc.
        executeSubscription(id_, subscriber);
    }

    function executeSubscription(uint256 id_, address subscriber) public {
        require(id_ & TYPE_NF_BIT == 0, "Qualla/Wrong-Token-Type");
        require(id_ & NF_INDEX_MASK > 0, "Qualla/Invalid-Subscription-Index");
        require(_balances[id_][subscriber] == 1, "Qualla/Invalid-Subscriber");
        require(
            quallaStorage.getUint(
                keccak256(abi.encode("token.nextWidthdraw", id_))
            ) < block.timestamp,
            "Qualla/Subscription-Not-Ready"
        );

        

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

        address creator =
            quallaStorage.getAddress(
                keccak256(abi.encode("token.creator", id))
            );

        creator._verifySignature(
            quallaStorage.getUint(keccak256(abi.encode("user.nonce", creator))),
            "burn",
            v,
            r,
            s,
            DOMAIN_SEPARATOR,
            USER_TYPEHASH
        );

        _burn(creator, id, amount);
        incUserNonce(creator);
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

        subscriber._verifySignature(
            quallaStorage.getUint(
                keccak256(abi.encode("user.nonce", subscriber))
            ),
            "unsubscribe",
            v,
            r,
            s,
            DOMAIN_SEPARATOR,
            USER_TYPEHASH
        );

        _burn(subscriber, id_, 1);
        _mint(
            quallaStorage.getAddress(
                keccak256(abi.encode("token.creator", id_ & NONCE_MASK))
            ),
            id_ & NONCE_MASK,
            1,
            bytes("")
        );
    }

    // Internal Functions

    function incUserNonce(address user) internal {
        quallaStorage.setUint(
            keccak256(abi.encode("user.nonce", user)),
            quallaStorage
                .getUint(keccak256(abi.encode("user.nonce", user)))
                .add(1)
        );
    }

    function incTokenNonce(uint256 byVal) internal {
        quallaStorage.setUint(
            keccak256(abi.encode("tokenNonce")),
            quallaStorage.getUint(keccak256(abi.encode("tokenNonce"))).add(
                byVal
            )
        );
    }

    function incTokenIndex(uint256 id) internal {
        quallaStorage.setUint(
            keccak256(abi.encode("token.nonce", id)),
            quallaStorage.getUint(keccak256(abi.encode("token.nonce", id))).add(
                1
            )
        );
    }
}
