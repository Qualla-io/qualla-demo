pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "./interfaces/ISubscriptionFactory.sol";

contract SubscriptionV1 {
    using SafeMath for uint256;
    using ECDSA for bytes32;

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    struct Subscriber {
        address subscriber;
        address paymentToken;
        // Enum.Status status;
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
    function getSubscriptionHash(
        address subscriber,
        uint256 value,
        address paymentToken
    ) public view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    bytes1(0x19),
                    bytes1(0),
                    subscriber,
                    value,
                    paymentToken
                )
            );
    }

    // ------------------------ Internal Functions ------------------------------------
    function _getSubscriptionSigner(
        bytes32 subscriptionHash,
        bytes memory signatures
    ) internal pure returns (address) {
        return subscriptionHash.toEthSignedMessageHash().recover(signatures);
    }
}
