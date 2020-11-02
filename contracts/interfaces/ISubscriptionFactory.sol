pragma solidity 0.6.12;

interface ISubscriptionFactory {
    event SubscriptionCreated(address indexed publisher, address subscription);

    function fee() external view returns(uint);
    function master() external view returns(address);

    function allSubscriptionsLength() external view returns(uint);
    function allSubscriptions(uint) external view returns(address);
    function getSubscription(address publisher) external view returns(address);

    function setFee(uint) external;
    function setMaster(address) external;
    function createSubscription(address publisher, address[] memory paymentTokens, uint256[] memory acceptedValues) external returns (address payable subscription);
}