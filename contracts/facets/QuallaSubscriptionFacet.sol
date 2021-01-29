// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IERC165.sol";
import "../interfaces/IERC1155.sol";
import "../libraries/LibSubscriptions.sol";
import "../libraries/LibDiamond.sol";
import "../libraries/LibERC1155.sol";

import "hardhat/console.sol";

contract QuallaSubscriptionsFacet is Context, IERC1155 {
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
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();
        return ss._balances[id][account];
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
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint256 i = 0; i < accounts.length; ++i) {
            require(
                accounts[i] != address(0),
                "ERC1155: batch balance query for the zero address"
            );
            batchBalances[i] = ss._balances[ids[i]][accounts[i]];
        }

        return batchBalances;
    }

    /***********************************|
   |             Write Functions        |
   |__________________________________*/

    function setApprovalForAll(address operator, bool approved)
        external
        override
    {
        require(
            _msgSender() != operator,
            "ERC1155: setting approval status for self"
        );
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();
        ss._operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    function isApprovedForAll(address account, address operator)
        public
        view
        override
        returns (bool)
    {
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();
        return ss._operatorApprovals[account][operator];
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
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        address operator = _msgSender();

        // _beforeTokenTransfer(
        //     operator,
        //     from,
        //     to,
        //     _asSingletonArray(id),
        //     _asSingletonArray(amount),
        //     data
        // );

        ss._balances[id][from] = ss._balances[id][from].sub(
            amount,
            "ERC1155: insufficient balance for transfer"
        );

        ss._balances[id][to] = ss._balances[id][to].add(amount);

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

        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        // _beforeTokenTransfer(operator, from, to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids[i];

            ss._balances[id][from] = ss._balances[id][from].sub(
                amounts[i],
                "ERC1155: insufficient balance for transfer"
            );
            ss._balances[id][to] = ss._balances[id][to].add(amounts[i]);
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
        verifyAndInc(creator, "mint", v, r, s);

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

        _mint(creator, id, amount, "");
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
        verifyAndInc(creator, "mint", v, r, s);

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

        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        address creator = ss.baseToken[id].creator;

        verifyAndInc(creator, "burn", v, r, s);
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

        verifyAndInc(subscriber, "subscribe", v, r, s);

        uint256 id_ = id | _token.nonce;

        ss.subToken[id_] = LibSubscriptions.SubToken(0, 0, block.timestamp);

        _burn(_token.creator, id, 1);
        _mint(subscriber, id_, 1, bytes(""));

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

        verifyAndInc(subscriber, "unsubscribe", v, r, s);

        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        _burn(subscriber, id_, 1);
        _mint(
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

        require(
            ss._balances[id_][subscriber] == 1,
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
            _burn(subscriber, id_, 1);
            _mint(_token.creator, id, 1, bytes(""));
        } else {
            ss.subToken[id_].nonce = ss.subToken[id_].nonce.add(1);
        }
        // ------------------------------

        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();

        uint256 creatorCut = 100 - ds.fee;

        // burn token in not enough funds or allowance
        if (
            _token.paymentToken.allowance(subscriber, address(this)) <
            _token.paymentValue ||
            _token.paymentToken.balanceOf(subscriber) < _token.paymentValue
        ) {
            _burn(subscriber, id_, 1);
            _mint(_token.creator, id, 1, bytes(""));
        }

        // _transfer tokens

        _token.paymentToken.transferFrom(
            subscriber,
            ds.contractOwner,
            _token.paymentValue.mul(ds.fee).div(100)
        );

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

    /***********************************|
   |          NFT       Functions        |
   |__________________________________*/

    function getTest() external view returns (uint256) {
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        return ss.test;
    }

    function mintNFTtoSubscribers(
        uint256 baseTokenId,
        string memory _uri,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        verifyAndInc(ss.baseToken[baseTokenId].creator, "nft", v, r, s);

        uint256 id = (ss.tokenNonce.add(1) << 128);
        id = (id | TYPE_NF_BIT);

        ss.test = id;

        ss.nftToken[id] = LibSubscriptions.NFTToken(
            _uri,
            block.timestamp,
            baseTokenId,
            1,
            ss.baseToken[baseTokenId].creator
        );

        // Amounts = baseToken.nonce is going to mint extra nfts for burnt sub tokens but thats ok for now.
        _mint(
            ss.baseToken[baseTokenId].creator,
            id,
            ss.baseToken[baseTokenId].nonce,
            bytes("")
        );

        ss.tokenNonce = ss.tokenNonce.add(1);
    }

    function mintNFTtoSubscribersBatch(
        uint256[] memory baseTokenId,
        string memory _uri,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();
        address creator = ss.baseToken[baseTokenId[0]].creator;

        verifyAndInc(creator, "nft", v, r, s);

        uint256[] memory ids = new uint256[](baseTokenId.length);
        uint256[] memory amounts = new uint256[](baseTokenId.length);

        for (uint256 i; i < baseTokenId.length; i++) {
            require(
                ss.baseToken[baseTokenId[i]].creator == creator,
                "Qualla/Invalid Creator"
            );

            ids[i] = (ss.tokenNonce.add(1) << 128);
            ids[i] = (ids[i] | TYPE_NF_BIT);

            // same amounts comment as above
            amounts[i] = ss.baseToken[baseTokenId[i]].nonce;

            ss.nftToken[ids[i]] = LibSubscriptions.NFTToken(
                _uri,
                block.timestamp,
                baseTokenId[i],
                1,
                creator
            );

            ss.tokenNonce = ss.tokenNonce.add(1);
        }

        _mintBatch(
            ss.baseToken[baseTokenId[0]].creator,
            ids,
            amounts,
            bytes("")
        );
    }

    function claimNFT(
        address user,
        uint256 subTokenId,
        uint256 nftTokenId,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        verifyAndInc(user, "claim", v, r, s);

        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();
        require(ss._balances[subTokenId][user] > 0, "Qualla/Invalid User");
        require(
            subTokenId & NONCE_MASK == ss.nftToken[nftTokenId].baseToken,
            "Qualla/Invalid Redeem"
        );
        require(
            //Subtoken must be minted before nft
            ss.subToken[subTokenId].mintStamp <
                ss.nftToken[nftTokenId].mintStamp,
            "Qualla/Invalid mintstamp"
        );
        require(
            ss.nftRedeemed[nftTokenId][subTokenId] == false,
            "Qualla/Already Redeemed"
        );

        uint256 id = nftTokenId | ss.nftToken[nftTokenId].nonce;

        _mint(user, id, 1, bytes(""));
        _burn(ss.nftToken[nftTokenId].creator, nftTokenId, 1);

        ss.nftRedeemed[nftTokenId][subTokenId] = true;
    }

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

        address operator = _msgSender();

        //  _beforeTokenTransfer(operator, address(0), to, ids, amounts, data); // Unused Hook

        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        ss._balances[id][account] = ss._balances[id][account].add(amount);
        emit TransferSingle(operator, address(0), account, id, amount);

        LibERC1155.onERC1155Received(
            operator,
            address(0),
            account,
            id,
            amount,
            data
        );
    }

    function _mintBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        require(account != address(0), "ERC1155: mint to the zero address");

        address operator = _msgSender();

        // _beforeTokenTransfer(operator, address(0), to, ids, amounts, data); // Unused Hook

        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        for (uint256 i = 0; i < ids.length; i++) {
            ss._balances[ids[i]][account] = amounts[i].add(
                ss._balances[ids[i]][account]
            );
        }

        emit TransferBatch(operator, address(0), account, ids, amounts);

        LibERC1155.onERC1155BatchReceived(
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
    ) internal virtual {
        require(account != address(0), "ERC1155: burn from the zero address");

        address operator = _msgSender();

        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();

        // Unused Hook
        // _beforeTokenTransfer(
        //     operator,
        //     account,
        //     address(0),
        //     _asSingletonArray(id),
        //     _asSingletonArray(amount),
        //     ""
        // );

        ss._balances[id][account] = ss._balances[id][account].sub(
            amount,
            "ERC1155: burn amount exceeds balance"
        );

        emit TransferSingle(operator, account, address(0), id, amount);
    }

    function verifyAndInc(
        address creator,
        string memory action,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal {
        LibSubscriptions.SubscriptionStorage storage ss =
            LibSubscriptions.subscriptionStorage();
        LibDiamond.verifySignature(
            creator,
            ss.userProps[creator].nonce,
            action,
            v,
            r,
            s
        );
        LibSubscriptions.incUserNonce(creator);
    }
}
