// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/SafeCast.sol";
import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "../interfaces/IBeamTokenFacet.sol";

import "../libraries/LibAppStorage.sol";
import "../libraries/LibERC1155.sol";

contract BeamTokenFacet is IBeamTokenFacet, LibAppBase {
    using SafeMath for uint256;
    using SafeCast for uint256;
    using SignedSafeMath for int256;
    using SafeCast for int256;

    function realtimeBalanceOf(
        IQtoken token,
        address account,
        uint256 timestamp
    ) public view override returns (int256 dynamicBal, uint256 deposit) {
        // assumes no delinquint flows?

        // console.log(timestamp);
        // console.log(state.userFlowData[token][account].netFlowRate.toUint256());

        dynamicBal = timestamp
            .sub(state.userFlowData[token][account].lastUpdated)
            .toInt256()
            .mul(state.userFlowData[token][account].netFlowRate);

        deposit = state.userFlowData[token][account].netDeposit;
    }

    function reatimeBalanceNow(IQtoken token, address account)
        external
        view
        returns (int256 dynamicBal, uint256 deposit)
    {
        return realtimeBalanceOf(token, account, block.timestamp);
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
        require(id & LibAppStorage.TYPE_NF_BIT == 0, "Qualla/Wrong-Token-Type");
        require(
            id & LibAppStorage.NF_INDEX_MASK == 0,
            "Qualla/Invalid-Subscription-Index"
        );

        BaseToken memory _token = state.baseToken[id];

        require(_token.creator != address(0), "Qualla/Invalid-Token-Id");

        LibERC1155.verifySignature(subscriber, "subscribe", v, r, s);

        uint256 id_ = id | _token.nonce;

        uint256 _deposit = _token.flowRate.mul(state.liqPeriod);

        BeamToken memory _beamToken =
            BeamToken(
                _token.creator,
                subscriber,
                _token.flowRate,
                _deposit,
                block.timestamp,
                _token.paymentToken
            );

        // create beam flow
        state.beamToken[id_] = _beamToken;

        // update users flow

        _updateUsersFlow(
            _token.paymentToken,
            _token.creator,
            _token.flowRate.toInt256(),
            0
        );

        _updateUsersFlow(
            _token.paymentToken,
            subscriber,
            int256(0).sub(_token.flowRate.toInt256()),
            _deposit.toInt256()
        );

        LibERC1155._burn(_token.creator, id, 1);
        LibERC1155._mint(subscriber, id_, 1, bytes(""));

        state.baseToken[id].nonce = state.baseToken[id].nonce.add(1);
        state.baseToken[id].activeBeams = state.baseToken[id].activeBeams.add(
            1
        );

        state.userBeams[_token.creator].push(_beamToken);
        state.userBeams[subscriber].push(_beamToken);

        _requireSufficientBalance(_token.paymentToken, subscriber);
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
            state.beamToken[id_].to,
            id_ & LibAppStorage.NONCE_MASK,
            1,
            bytes("")
        );

        state.baseToken[id_ & LibAppStorage.NONCE_MASK].activeBeams = state
            .baseToken[id_ & LibAppStorage.NONCE_MASK]
            .activeBeams
            .add(1);

        _updateUsersFlow(
            state.beamToken[id_].paymentToken,
            state.beamToken[id_].to, // creator
            int256(0).sub(state.beamToken[id_].flowRate.toInt256()),
            0
        );

        _updateUsersFlow(
            state.beamToken[id_].paymentToken,
            subscriber,
            state.beamToken[id_].flowRate.toInt256(),
            int256(0).sub(state.beamToken[id_].deposit.toInt256())
        );
    }

    function liquidateBeam(uint256 id_) external {
        require(
            !state.beamtTiken[id_].paymentToken.isAccountLiquid(
                state.beamToken[id_].from,
                block.timestamp
            ),
            "Qualla/Liquid-Beam"
        );

        // send deposite to liquidator

        // update flows

        // update nft claims

        // burn token?


    }

    // --- Internal Functions ---------------------
    function _updateUsersFlow(
        IQtoken qToken,
        address user,
        int256 flowRateDelta,
        int256 depositDelta
    ) internal {
        UserFlow memory oldFlow = state.userFlowData[qToken][user];

        int256 deltaBalance =
            block.timestamp.sub(oldFlow.lastUpdated).toInt256().mul(
                oldFlow.netFlowRate
            );

        // console.log(deltaBalance.toUint256());

        qToken.settleBalance(user, deltaBalance);

        state.userFlowData[qToken][user] = UserFlow(
            oldFlow.netFlowRate.add(flowRateDelta),
            oldFlow.netDeposit.toInt256().add(depositDelta).toUint256(),
            block.timestamp
        );
    }

    function _requireSufficientBalance(IQtoken token, address user)
        internal
        view
    {
        // get realtime balance
        // require balance > 0
        (int256 availBal, ) = token.realtimeBalanceOf(user, block.timestamp);
        require(availBal >= 0, "Qualla/Insufficient-realtime-funds");
    }
}
