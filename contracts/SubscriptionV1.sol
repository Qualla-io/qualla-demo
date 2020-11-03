pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "./interfaces/ISubscriptionFactory.sol";
import "./Enum.sol";

contract SubscriptionV1 is Enum {
    using SafeMath for uint256;
    using ECDSA for bytes32;

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    struct Subscriber {
        address subscriber;
        address paymentToken;
        Enum.Status status;
        uint256 value;
        uint256 nextWithdraw;
        bytes signedHash;
    }

    address public factory;
    address public publisher;

    address[] public paymentTokens;
    uint256[] public acceptedValues;
    Subscriber[] public allSubscribers;

    event Received(address indexed sender, uint256 value);
    event newSubscriber(address indexed subscriber, uint256 value);
    event bytesEvent(bytes32 test);

    mapping(bytes32 => uint256) public hashToSubscription;
    mapping(address => bool) public validToken;
    mapping(uint256 => bool) public validValue;

    constructor() public {
        factory = msg.sender;
    }

    // called once by the factory at time of deployment
    function initialize(
        address _publisher,
        address[] memory _paymentTokens,
        uint256[] memory _acceptedValues
    ) external {
        require(msg.sender == factory, "FORBIDDEN");
        publisher = _publisher;
        paymentTokens = _paymentTokens;
        acceptedValues = _acceptedValues;

        for (uint256 i = 0; i < paymentTokens.length; i++) {
            validToken[paymentTokens[i]] = true;
        }

        for (uint256 i = 0; i < acceptedValues.length; i++) {
            validValue[acceptedValues[i]] = true;
        }

        allSubscribers.push(
            Subscriber(
                address(0),
                address(0),
                Enum.Status.EXPIRED,
                0,
                0,
                abi.encode(0)
            )
        );
    }

    function withdraw() external {
        uint256 fee = ISubscriptionFactory(factory).fee(); // %
        address master = ISubscriptionFactory(factory).master();

        for (uint256 i = 0; i < paymentTokens.length; i++) {
            uint256 publisherBal = ERC20(paymentTokens[i]).balanceOf(publisher);
            uint256 contractBal = ERC20(paymentTokens[i]).balanceOf(
                address(this)
            );
            uint256 feeTotal = contractBal.mul(fee).div(100);
            ERC20(paymentTokens[i]).transfer(master, feeTotal);
            ERC20(paymentTokens[i]).transfer(
                publisher,
                contractBal.sub(feeTotal)
            );
            require(
                publisherBal.add(contractBal).sub(feeTotal) ==
                    ERC20(paymentTokens[i]).balanceOf(publisher),
                "FAILED TRANSFER"
            );
        }
    }

    // ------------------------ View Functions ------------------------------------

    // Used for initiating and modifying
    function getSubscriptionHash(
        address subscriber,
        uint256 value,
        address paymentToken,
        Enum.Status status
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    bytes1(0x19),
                    bytes1(0),
                    subscriber,
                    value,
                    paymentToken,
                    status
                )
            );
    }

    function allSubscribersLength() external view returns (uint256) {
        return allSubscribers.length;
    }

    function isHashValid(bytes32 subscriptionHash) public view returns (bool) {
        uint256 subNumber = hashToSubscription[subscriptionHash];
        Subscriber memory _sub = allSubscribers[subNumber];
        return (_sub.subscriber != address(0) &&
            _sub.nextWithdraw < block.timestamp &&
            _sub.status == Enum.Status.ACTIVE &&
            _sub.subscriber ==
            _getHashSigner(subscriptionHash, _sub.signedHash));
    }

    // ------------------------ Public Functions ------------------------------------

    function createSubscription(
        address _subscriber,
        uint256 _value,
        address _paymentToken,
        bytes memory _signedHash
    ) external {
        bytes32 _subscriptionHash = getSubscriptionHash(
            _subscriber,
            _value,
            _paymentToken,
            Enum.Status.ACTIVE
        );

        emit bytesEvent(_subscriptionHash);

        require(
            hashToSubscription[_subscriptionHash] == 0,
            "REPEAT SUBSCRIPTION"
        );

        require(validToken[_paymentToken] == true, "INVALID TOKEN");
        require(validValue[_value] == true, "INVALID VALUE");

        address _signer = _getHashSigner(_subscriptionHash, _signedHash);
        require(_signer == _subscriber, "INVALID SIGNATURE");

        allSubscribers.push(
            Subscriber(
                _subscriber,
                _paymentToken,
                Enum.Status.ACTIVE,
                _value,
                block.timestamp - 1,
                _signedHash
            )
        );

        hashToSubscription[_subscriptionHash] = allSubscribers.length - 1;

        emit newSubscriber(_subscriber, _value);
    }

    function executeSubscription(bytes32 subscriptionHash) public {
        require(isHashValid(subscriptionHash), "INVALID HASH");
        uint256 subNumber = hashToSubscription[subscriptionHash];
        _transferTokens(subNumber);
        _updateTimestamp(subNumber);
    }

    // ------------------------ Internal Functions ------------------------------------
    function _getHashSigner(bytes32 subscriptionHash, bytes memory signatures)
        internal
        pure
        returns (address)
    {
        return subscriptionHash.toEthSignedMessageHash().recover(signatures);
    }

    function _updateTimestamp(uint256 _subNumber) internal {
        // Defaults to one month
        allSubscribers[_subNumber].nextWithdraw = allSubscribers[_subNumber]
            .nextWithdraw
            .add(2592000);
    }

    function _transferTokens(uint256 _subNumber) internal {
        Subscriber memory _sub = allSubscribers[_subNumber];

        uint256 _startingBal = ERC20(_sub.paymentToken).balanceOf(
            address(this)
        );

        ERC20(_sub.paymentToken).transferFrom(
            _sub.subscriber,
            address(this),
            _sub.value
        );

        require(
            _startingBal.add(_sub.value) == ERC20(_sub.paymentToken).balanceOf(
                address(this)
            ),
            "TRANSFER FAILED"
        );
    }
}
