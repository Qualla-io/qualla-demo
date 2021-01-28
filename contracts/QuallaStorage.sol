//SPDX-License-Identifier: Unlicense
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract QuallaStorage is Ownable {
    constructor(address[] memory quallaContracts) {
        // initialize contracts if already deployed
        for (uint256 i = 0; i < quallaContracts.length; i++) {
            addressStorage[
                keccak256(
                    abi.encode("contract.address", quallaContracts[i])
                )
            ] = quallaContracts[i];
        }
    }

    /**** Storage Types *******/

    mapping(bytes32 => uint256) private uIntStorage;
    mapping(bytes32 => string) private stringStorage;
    mapping(bytes32 => address) private addressStorage;
    mapping(bytes32 => bytes) private bytesStorage;
    mapping(bytes32 => bool) private boolStorage;
    mapping(bytes32 => int256) private intStorage;

    modifier onlyQualla() {
        if (address(msg.sender) != owner()) {
            require(
                addressStorage[
                    keccak256(abi.encode("contract.address", msg.sender))
                ] != address(0)
            );
        }
        _;
    }

    /**** Get Methods ***********/

    /// @param _key The key for the record
    function getAddress(bytes32 _key) external view returns (address) {
        return addressStorage[_key];
    }

    /// @param _key The key for the record
    function getUint(bytes32 _key) external view returns (uint256) {
        return uIntStorage[_key];
    }

    /// @param _key The key for the record
    function getString(bytes32 _key) external view returns (string memory) {
        return stringStorage[_key];
    }

    /// @param _key The key for the record
    function getBytes(bytes32 _key) external view returns (bytes memory) {
        return bytesStorage[_key];
    }

    /// @param _key The key for the record
    function getBool(bytes32 _key) external view returns (bool) {
        return boolStorage[_key];
    }

    /// @param _key The key for the record
    function getInt(bytes32 _key) external view returns (int256) {
        return intStorage[_key];
    }

    /**** Set Methods ***********/

    /// @param _key The key for the record
    function setAddress(bytes32 _key, address _value) external onlyQualla {
        addressStorage[_key] = _value;
    }

    /// @param _key The key for the record
    function setUint(bytes32 _key, uint256 _value) external onlyQualla {
        uIntStorage[_key] = _value;
    }

    /// @param _key The key for the record
    function setString(bytes32 _key, string memory _value) external onlyQualla {
        stringStorage[_key] = _value;
    }

    /// @param _key The key for the record
    function setBytes(bytes32 _key, bytes memory _value) external onlyQualla {
        bytesStorage[_key] = _value;
    }

    /// @param _key The key for the record
    function setBool(bytes32 _key, bool _value) external onlyQualla {
        boolStorage[_key] = _value;
    }

    /// @param _key The key for the record
    function setInt(bytes32 _key, int256 _value) external onlyQualla {
        intStorage[_key] = _value;
    }

    /**** Delete Methods ***********/

    /// @param _key The key for the record
    function deleteAddress(bytes32 _key) external onlyQualla {
        delete addressStorage[_key];
    }

    /// @param _key The key for the record
    function deleteUint(bytes32 _key) external onlyQualla {
        delete uIntStorage[_key];
    }

    /// @param _key The key for the record
    function deleteString(bytes32 _key) external onlyQualla {
        delete stringStorage[_key];
    }

    /// @param _key The key for the record
    function deleteBytes(bytes32 _key) external onlyQualla {
        delete bytesStorage[_key];
    }

    /// @param _key The key for the record
    function deleteBool(bytes32 _key) external onlyQualla {
        delete boolStorage[_key];
    }

    /// @param _key The key for the record
    function deleteInt(bytes32 _key) external onlyQualla {
        delete intStorage[_key];
    }
}
