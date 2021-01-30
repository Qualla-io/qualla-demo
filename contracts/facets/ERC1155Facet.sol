// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "../interfaces/IERC1155.sol";
import "../libraries/LibERC1155.sol";
import "../libraries/LibSubscriptions.sol";

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/GSN/Context.sol";

contract ERC1155Facet is IERC1155, Context {
    using SafeMath for uint256;

    function getUserNonce(address user) external view returns (uint256) {
        LibERC1155.ERC1155Storage storage erc1155 = LibERC1155.erc1155Storage();
        return erc1155.userProps[user].nonce;
    }

    /**
     * @dev See {IERC1155MetadataURI-uri}.
     *
     * This implementation returns the same URI for *all* token types. It relies
     * on the token type ID substitution mechanism
     * https://eips.ethereum.org/EIPS/eip-1155#metadata[defined in the EIP].
     *
     * Clients calling this function must replace the `\{id\}` substring with the
     * actual token type ID.
     */
    function uri(uint256 id)
        external
        view
        virtual
        override
        returns (string memory)
    {
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();
        return ss.nftToken[id & (uint256(uint128(~0)) << 128)].uri; // id & NONCE_MASK
    }

    /**
     * @dev Returns the amount of tokens of token type `id` owned by `account`.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function balanceOf(address account, uint256 id)
        external
        view
        override
        returns (uint256)
    {
        LibERC1155.ERC1155Storage storage erc1155 = LibERC1155.erc1155Storage();
        return erc1155._balances[id][account];
    }

    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids)
        external
        view
        override
        returns (uint256[] memory)
    {
        require(
            accounts.length == ids.length,
            "ERC1155: accounts and ids length mismatch"
        );
        LibERC1155.ERC1155Storage storage erc1155 = LibERC1155.erc1155Storage();

        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint256 i = 0; i < accounts.length; ++i) {
            require(
                accounts[i] != address(0),
                "ERC1155: batch balance query for the zero address"
            );
            batchBalances[i] = erc1155._balances[ids[i]][accounts[i]];
        }

        return batchBalances;
    }

    function setApprovalForAll(address operator, bool approved)
        external
        override
    {
        require(
            _msgSender() != operator,
            "ERC1155: setting approval status for self"
        );
        LibERC1155.ERC1155Storage storage erc1155 = LibERC1155.erc1155Storage();
        erc1155._operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    function isApprovedForAll(address account, address operator)
        public
        view
        override
        returns (bool)
    {
        LibERC1155.ERC1155Storage storage erc1155 = LibERC1155.erc1155Storage();
        return erc1155._operatorApprovals[account][operator];
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external override {
        require(to != address(0), "ERC1155: transfer to the zero address");
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );
        LibERC1155.ERC1155Storage storage erc1155 = LibERC1155.erc1155Storage();

        address operator = _msgSender();

        // _beforeTokenTransfer(
        //     operator,
        //     from,
        //     to,
        //     _asSingletonArray(id),
        //     _asSingletonArray(amount),
        //     data
        // );

        erc1155._balances[id][from] = erc1155._balances[id][from].sub(
            amount,
            "ERC1155: insufficient balance for transfer"
        );

        erc1155._balances[id][to] = erc1155._balances[id][to].add(amount);

        emit TransferSingle(operator, from, to, id, amount);

        LibERC1155.onERC1155Received(operator, from, to, id, amount, data);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external override {
        require(
            ids.length == amounts.length,
            "ERC1155: ids and amounts length mismatch"
        );
        require(to != address(0), "ERC1155: transfer to the zero address");
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: transfer caller is not owner nor approved"
        );

        LibERC1155.ERC1155Storage storage erc1155 = LibERC1155.erc1155Storage();

        // _beforeTokenTransfer(operator, from, to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids[i];

            erc1155._balances[id][from] = erc1155._balances[id][from].sub(
                amounts[i],
                "ERC1155: insufficient balance for transfer"
            );
            erc1155._balances[id][to] = erc1155._balances[id][to].add(
                amounts[i]
            );
        }

        emit TransferBatch(_msgSender(), from, to, ids, amounts);

        LibERC1155.onERC1155BatchReceived(
            _msgSender(),
            from,
            to,
            ids,
            amounts,
            data
        );
    }
}
