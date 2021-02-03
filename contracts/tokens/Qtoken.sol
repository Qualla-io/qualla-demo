// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/GSN/Context.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/SafeCast.sol";
import "@openzeppelin/contracts/math/SignedSafeMath.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";

import "./IQtoken.sol";
import "../interfaces/IBeamTokenFacet.sol";

import "./IERC20.sol";

import "hardhat/console.sol";

contract Qtoken is IERC20, IQtoken, Initializable, Context {
    using SafeMath for uint256;
    using SafeCast for uint256;
    using SignedSafeMath for int256;
    using SafeCast for int256;

    mapping(address => int256) internal _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 internal _totalSupply;

    string internal _name;
    string internal _symbol;
    uint8 internal _decimals;

    IERC20 internal _underlyingToken;

    address internal _defaultOperator; //Diamond Contract

    struct ActiveBeams {
        address reciepient;
        address sender;
        uint256 flowRate;
        uint256 beamID;
    }

    function initialize(
        IERC20 underlyingToken_,
        uint8 decimals_,
        string memory name_,
        string memory symbol_
    ) external initializer {
        _underlyingToken = underlyingToken_;
        _decimals = decimals_;
        _name = name_;
        _symbol = symbol_;

        // Set msg.sender as default operator
        _defaultOperator = msg.sender;
    }

    // --- Read Functions -------------------------

    function balanceOf(address account)
        public
        view
        override
        returns (uint256 balance)
    {
        (int256 availBalance, ) = realtimeBalanceOf(account, block.timestamp);
        return availBalance > 0 ? availBalance.toUint256() : 0;
    }

    function realtimeBalanceOf(address account, uint256 timestamp)
        public
        view
        override
        returns (int256 availableBalance, uint256 deposit)
    {
        availableBalance = _balances[account];
        (int256 dynamicBal, uint256 beamDeposit) =
            IBeamTokenFacet(_defaultOperator).realtimeBalanceOf(
                this,
                account,
                timestamp
            );

        availableBalance = availableBalance.add(dynamicBal).sub(
            beamDeposit.toInt256()
        );
        deposit = deposit.add(beamDeposit);
    }

    function isAccoundCritical(address account, uint256 timestamp)
        public
        view
        override
        returns (bool critical)
    {
        (int256 availableBal, ) = realtimeBalanceOf(account, timestamp);

        return availableBal > 0;
    }

    function isAccountLiquid(address account, uint256 timestamp)
        public
        view
        override
        returns (bool liquid)
    {
        (int256 availableBal, uint256 deposit) =
            realtimeBalanceOf(account, timestamp);

        return availableBal.add(deposit.toInt256()) > 0;
    }

    function getUnderlyingToken() external view override returns (address) {
        return address(_underlyingToken);
    }

    // --- ERC-20 Read Functions ------------------

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5,05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the value {ERC20} uses, unless {_setupDecimals} is
     * called.
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view virtual returns (uint8) {
        return _decimals;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    // --- Write Functions ------------------------
    function demoMint(address account, uint256 amount)
        external
        override
        onlyOperator
    {
        _mint(account, amount);
    }

    function upgrade(uint256 amount) external override {
        _upgrade(msg.sender, amount);
    }

    function operatorUpgrade(address account, uint256 amount)
        external
        override
        onlyOperator
    {
        _upgrade(account, amount);
    }

    function downgrade(uint256 amount) external override {
        _downgrade(msg.sender, amount);
    }

    function operatorDowngrade(address account, uint256 amount)
        external
        override
        onlyOperator
    {
        _downgrade(account, amount);
    }

    function settleBalance(address account, int256 amount)
        external
        override
        onlyOperator
    {
        _balances[account] = _balances[account].add(amount);
        emit Settle(account, amount);
    }

    // --- ERC-20 Write Functions -----------------

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address recipient, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender)
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20}.
     *
     * Requirements:
     *
     * - `sender` and `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     * - the caller must have allowance for ``sender``'s tokens of at least
     * `amount`.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(
            sender,
            _msgSender(),
            _allowances[sender][_msgSender()].sub(
                amount,
                "ERC20: transfer amount exceeds allowance"
            )
        );
        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue)
        public
        virtual
        returns (bool)
    {
        _approve(
            _msgSender(),
            spender,
            _allowances[_msgSender()][spender].add(addedValue)
        );
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        virtual
        returns (bool)
    {
        _approve(
            _msgSender(),
            spender,
            _allowances[_msgSender()][spender].sub(
                subtractedValue,
                "ERC20: decreased allowance below zero"
            )
        );
        return true;
    }

    // --- Internal Functions ---------------------

    function _upgrade(address account, uint256 amount) internal {
        // transfer underlying from user to this
        _underlyingToken.transferFrom(account, address(this), amount);

        // mint wrapped tokens
        _mint(account, amount);
    }

    function _downgrade(address account, uint256 amount) internal {
        // transfer underlying from this to user
        _underlyingToken.transfer(account, amount);

        // require positive realtime balance

        // burn wrapped tokens
        _burn(account, amount);
    }

    function _mint(address account, uint256 amount) internal {
        _balances[account] = _balances[account].add(amount.toInt256());
        _totalSupply = _totalSupply.add(amount);

        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal {
        (int256 availableBalance, ) =
            realtimeBalanceOf(account, block.timestamp);
        require(
            availableBalance >= amount.toInt256(),
            "ERC20: burn amount exceeds balance"
        );
        _balances[account] = _balances[account].sub(amount.toInt256());
        _totalSupply = _totalSupply.sub(amount);
        emit Transfer(account, address(0), amount);
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(sender, recipient, amount);

        (int256 availableBalance, ) =
            realtimeBalanceOf(sender, block.timestamp);

        require(
            availableBalance >= amount.toInt256(),
            "ERC20: transfer amount exceeds balance"
        );

        _balances[sender] = _balances[sender].sub(amount.toInt256());
        _balances[recipient] = _balances[recipient].add(amount.toInt256());
        emit Transfer(sender, recipient, amount);
    }

    // --- ERC-20 Internal Functions --------------

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Sets {decimals} to a value other than the default one of 18.
     *
     * WARNING: This function should only be called from the constructor. Most
     * applications that interact with token contracts will not expect
     * {decimals} to ever change, and may work incorrectly if it does.
     */
    function _setupDecimals(uint8 decimals_) internal virtual {
        _decimals = decimals_;
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * will be to transferred to `to`.
     * - when `from` is zero, `amount` tokens will be minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {}

    // --- Modifier Functions ---------------------

    modifier onlyOperator() {
        require(msg.sender == _defaultOperator);
        _;
    }
}
