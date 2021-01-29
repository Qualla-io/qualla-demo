// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

import "hardhat/console.sol";

interface IERC1155TokenReceiver {
    /**
        @notice Handle the receipt of a single ERC1155 token type.
        @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeTransferFrom` after the balance has been updated.        
        This function MUST return `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))` (i.e. 0xf23a6e61) if it accepts the transfer.
        This function MUST revert if it rejects the transfer.
        Return of any other value than the prescribed keccak256 generated value MUST result in the transaction being reverted by the caller.
        @param _operator  The address which initiated the transfer (i.e. LibMeta.msgSender())
        @param _from      The address which previously owned the token
        @param _id        The ID of the token being transferred
        @param _value     The amount of tokens being transferred
        @param _data      Additional data with no specified format
        @return           `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`
    */
    function onERC1155Received(
        address _operator,
        address _from,
        uint256 _id,
        uint256 _value,
        bytes calldata _data
    ) external returns (bytes4);

    /**
        @notice Handle the receipt of multiple ERC1155 token types.
        @dev An ERC1155-compliant smart contract MUST call this function on the token recipient contract, at the end of a `safeBatchTransferFrom` after the balances have been updated.        
        This function MUST return `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))` (i.e. 0xbc197c81) if it accepts the transfer(s).
        This function MUST revert if it rejects the transfer(s).
        Return of any other value than the prescribed keccak256 generated value MUST result in the transaction being reverted by the caller.
        @param _operator  The address which initiated the batch transfer (i.e. LibMeta.msgSender())
        @param _from      The address which previously owned the token
        @param _ids       An array containing ids of each token being transferred (order and length must match _values array)
        @param _values    An array containing amounts of each token being transferred (order and length must match _ids array)
        @param _data      Additional data with no specified format
        @return           `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`
    */
    function onERC1155BatchReceived(
        address _operator,
        address _from,
        uint256[] calldata _ids,
        uint256[] calldata _values,
        bytes calldata _data
    ) external returns (bytes4);
}

library LibERC1155 {
    using SafeMath for uint256;

    bytes32 constant DIAMOND_STORAGE_POSITION =
        keccak256("diamond.standard.ERC1155.storage");
    bytes4 internal constant ERC1155_ACCEPTED = 0xf23a6e61; // Return value from `onERC1155Received` call if a contract accepts receipt (i.e `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"))`).
    bytes4 internal constant ERC1155_BATCH_ACCEPTED = 0xbc197c81; // Return value from `onERC1155BatchReceived` call if a contract accepts receipt (i.e `bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`).

    struct User {
        uint256 nonce;
    }

    struct ERC1155Storage {
        mapping(uint256 => mapping(address => uint256)) _balances;
        mapping(address => mapping(address => bool)) _operatorApprovals;
        // Maybe make seperate user and verification lib?
        mapping(address => User) userProps;
        bytes32 DOMAIN_SEPARATOR;
        bytes32 USER_TYPEHASH;
        uint8 fee; // percent
        address feeCollector;
    }

    function erc1155Storage()
        internal
        pure
        returns (ERC1155Storage storage erc1155)
    {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            erc1155.slot := position
        }
    }

    /***********************************|
   |          ERC1155 Events             |
   |__________________________________*/

    /**
     * @dev Emitted when `value` tokens of token type `id` are transferred from `from` to `to` by `operator`.
     */
    event TransferSingle(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256 id,
        uint256 value
    );

    /**
     * @dev Equivalent to multiple {TransferSingle} events, where `operator`, `from` and `to` are the same for all
     * transfers.
     */
    event TransferBatch(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256[] ids,
        uint256[] values
    );

    /**
     * @dev Emitted when `account` grants or revokes permission to `operator` to transfer their tokens, according to
     * `approved`.
     */
    event ApprovalForAll(
        address indexed account,
        address indexed operator,
        bool approved
    );

    /***********************************|
   |          Internal Functions        |
   |__________________________________*/

    function _mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal {
        require(account != address(0), "ERC1155: mint to the zero address");

        address operator = _msgSender(); // This might be a problem

        //  _beforeTokenTransfer(operator, address(0), to, ids, amounts, data); // Unused Hook

        ERC1155Storage storage erc1155 = erc1155Storage();

        erc1155._balances[id][account] = erc1155._balances[id][account].add(
            amount
        );
        emit TransferSingle(operator, address(0), account, id, amount);

        onERC1155Received(operator, address(0), account, id, amount, data);
    }

    function _mintBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal {
        require(account != address(0), "ERC1155: mint to the zero address");

        address operator = _msgSender();

        // _beforeTokenTransfer(operator, address(0), to, ids, amounts, data); // Unused Hook

        ERC1155Storage storage erc1155 = erc1155Storage();

        for (uint256 i = 0; i < ids.length; i++) {
            erc1155._balances[ids[i]][account] = amounts[i].add(
                erc1155._balances[ids[i]][account]
            );
        }

        emit TransferBatch(operator, address(0), account, ids, amounts);

        onERC1155BatchReceived(
            operator,
            address(0),
            account,
            ids,
            amounts,
            data
        );
    }

    function _burn(
        address account,
        uint256 id,
        uint256 amount
    ) internal {
        require(account != address(0), "ERC1155: burn from the zero address");

        address operator = _msgSender();

        ERC1155Storage storage erc1155 = erc1155Storage();

        // Unused Hook
        // _beforeTokenTransfer(
        //     operator,
        //     account,
        //     address(0),
        //     _asSingletonArray(id),
        //     _asSingletonArray(amount),
        //     ""
        // );

        erc1155._balances[id][account] = erc1155._balances[id][account].sub(
            amount,
            "ERC1155: burn amount exceeds balance"
        );

        emit TransferSingle(operator, account, address(0), id, amount);
    }

    function onERC1155Received(
        address operator,
        address _from,
        address _to,
        uint256 _id,
        uint256 _value,
        bytes memory _data
    ) internal {
        uint256 size;
        assembly {
            size := extcodesize(_to)
        }
        if (size > 0) {
            require(
                ERC1155_ACCEPTED ==
                    IERC1155TokenReceiver(_to).onERC1155Received(
                        operator,
                        _from,
                        _id,
                        _value,
                        _data
                    ),
                "ERC1155: transfer to non ERC1155Receiver implementer"
            );
        }
    }

    function onERC1155BatchReceived(
        address operator,
        address _from,
        address _to,
        uint256[] memory _ids, // changed to memory. Hopefully doesnt cause proplems
        uint256[] memory _values, // changed to memory. Hopefully doesnt cause proplems
        bytes memory _data
    ) internal {
        uint256 size;
        assembly {
            size := extcodesize(_to)
        }
        if (size > 0) {
            require(
                ERC1155_BATCH_ACCEPTED ==
                    IERC1155TokenReceiver(_to).onERC1155BatchReceived(
                        operator,
                        _from,
                        _ids,
                        _values,
                        _data
                    ),
                "ERC1155: ERC1155Receiver rejected tokens"
            );
        }
    }

    // Context

    function _msgSender() internal view returns (address payable) {
        return msg.sender;
    }

    function _msgData() internal view returns (bytes memory) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }

    function verifySignature(
        address user,
        string memory action,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal {
        ERC1155Storage storage erc1155 = erc1155Storage();

        bytes32 digest =
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    erc1155.DOMAIN_SEPARATOR,
                    keccak256(
                        abi.encode(
                            erc1155.USER_TYPEHASH,
                            user,
                            erc1155.userProps[user].nonce,
                            keccak256(bytes(action))
                        )
                    )
                )
            );

        require(user == ecrecover(digest, v, r, s), "Qualla/invalid-permit");
        erc1155.userProps[user].nonce = erc1155.userProps[user].nonce.add(1);
    }
}
