pragma solidity 0.6.12;

import "./interfaces/ISubscriptionFactory.sol";
import "./SubscriptionV1.sol";

// contract SubscriptionFactory is ISubscriptionFactory {

contract SubscriptionFactory {
    address public master;
    uint8 public fee; //Percentage

    event subscriptionCreated(
        address indexed publisher,
        address subscription,
        address[] paymentTokens,
        uint256[] acceptedValues
    );

    event factoryModified(address master, uint8 fee);

    address[] public allSubscriptions;
    mapping(address => address) public getSubscription;

    constructor(uint8 _fee) public {
        master = msg.sender;
        fee = _fee;
        emit factoryModified(master, fee);
    }

    function allSubscriptionsLength() external view returns (uint256) {
        return allSubscriptions.length;
    }

    function createSubscription(
        address publisher,
        address[] memory paymentTokens,
        uint256[] memory acceptedValues
    ) external returns (address payable subscription) {
        require(getSubscription[publisher] == address(0), "REPEAT PUBLISHER");
        bytes memory bytecode = type(SubscriptionV1).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(publisher));
        assembly {
            subscription := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        SubscriptionV1(subscription).initialize(
            publisher,
            paymentTokens,
            acceptedValues
        );
        emit subscriptionCreated(
            publisher,
            subscription,
            paymentTokens,
            acceptedValues
        );

        getSubscription[publisher] = subscription;
        allSubscriptions.push(subscription);
    }

    function setFee(uint8 _fee) external {
        require(msg.sender == master, "FORBIDDEN");
        require(_fee < fee, "INVALID FEE INCREASE");
        fee = _fee;
        emit factoryModified(master, fee);
    }

    function setMaster(address _master) external {
        require(msg.sender == master, "FORBIDDEN");
        master = _master;
        emit factoryModified(master, fee);
    }
}
