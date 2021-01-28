//SPDX-License-Identifier: Unlicense
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./QuallaNFT.sol";
import "./QuallaSubscription.sol";
import "./QuallaStorage.sol";
import "./ERC1155.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract Qualla is Ownable, ERC1155 {
    using SafeMath for uint256;

    string public constant name = "Qualla Subscription";
    string public constant version = "1";

    QuallaStorage quallaStorage;
    QuallaSubscription quallaSubscription;
    QuallaNFT quallaNFT;

    constructor(
        string memory uri_,
        uint256 chainId_,
        address _quallaStorage
    ) ERC1155(uri_) {
        quallaStorage = QuallaStorage(_quallaStorage);

        quallaStorage.setUint(keccak256("chainId"), chainId_);
        // quallaStorage.setBytes(
        //     keccak256(abi.encode("DOMAIN_SEPARATOR")),
        //     keccak256(
        //         abi.encode(
        //             keccak256(
        //                 "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        //             ),
        //             keccak256(bytes(name)),
        //             keccak256(bytes(version)),
        //             chainId_,
        //             address(this)
        //         )
        //     )
        // );
    }

    function addContract(string memory name, address _contractAddress) public {
        // This lets other contracts retireve this by name
        quallaStorage.setAddress(
            keccak256(abi.encode("contract.name", name)),
            _contractAddress
        );

        // This lets the contract write to storage contract
        quallaStorage.setAddress(
            keccak256(abi.encode("contract.address", _contractAddress)),
            _contractAddress
        );
    }

    // Place holder for future top level functions
}
