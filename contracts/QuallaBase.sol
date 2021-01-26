//SPDX-License-Identifier: Unlicense
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ERC1155.sol";

contract QuallaBase is Context, ERC1155 {
    using SafeMath for uint256;

    // --- EIP712 niceties ---
    bytes32 public DOMAIN_SEPARATOR;
    bytes32 public constant USER_TYPEHASH =
        keccak256("User(address user,uint256 nonce,string action)");
    string public constant name = "Qualla Subscription";
    string public constant version = "1";
    uint256 public chainId;

    // --- ERC1155 niceties ---
    bytes4 private constant _INTERFACE_ID_ERC1155 = 0xd9b67a26;
    bytes4 private constant _INTERFACE_ID_ERC1155_METADATA_URI = 0x0e89341c;

    // Convention:
    // id = base id of token, has index of 0
    // id_ = instance id of token, has index of 1+

    uint256 public fee = 5; // Percent
    address master;

    uint256 public tokenNonce = 1;

    uint256 constant NONCE_MASK = uint256(uint128(~0)) << 128;
    uint256 constant NF_INDEX_MASK = uint128(~0);
    uint256 constant TYPE_NF_BIT = 1 << 255;

    // // how to add mask
    // id = (id | NF_INDEX_MASK);

    // // how to undo mask
    // id = ~(~id | NF_INDEX_MASK);

    // // get index (should work for NFT and Subs)
    // id & NF_INDEX_MASK

    constructor(string memory uri_, uint256 chainId_) ERC1155(uri_) {
        // register the supported interfaces to conform to ERC1155 via ERC165
        _registerInterface(_INTERFACE_ID_ERC1155);

        // register the supported interfaces to conform to ERC1155MetadataURI via ERC165
        _registerInterface(_INTERFACE_ID_ERC1155_METADATA_URI);

        chainId = chainId_;

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

        master = msg.sender;
    }

    // Events
    event contractModified(address master, uint256 fee);

    // Mappings
    mapping(address => uint256) public userNonce;

    // Public Functions
    function setFee(uint256 _fee) external {
        require(msg.sender == master, "FORBIDDEN");
        require(_fee < fee, "INVALID FEE INCREASE");
        fee = _fee;
        emit contractModified(master, fee);
    }

    function setMaster(address _master) external {
        require(msg.sender == master, "FORBIDDEN");
        master = _master;
        emit contractModified(master, fee);
    }

    // Internal Functions

    // TODO: Pass more data here to make it more secure
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

    function _asSingletonAddressArray(address element)
        internal
        pure
        returns (address[] memory)
    {
        address[] memory array = new address[](1);
        array[0] = element;

        return array;
    }
}
