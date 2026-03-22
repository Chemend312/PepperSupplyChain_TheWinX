// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PepperSupplyChain {

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin,"ONLY_ADMIN");
        _;
    }

    // =====================================================
    // ROLES
    // =====================================================

    mapping(address => bool) public farmers;
    mapping(address => bool) public processors;
    mapping(address => bool) public distributors;
    mapping(address => bool) public retailers;
    mapping(address => bool) public certifiers;

    event RoleGranted(string role,address user);

    function grantFarmer(address a) external onlyAdmin {
        farmers[a] = true;
        emit RoleGranted("FARMER",a);
    }

    function grantProcessor(address a) external onlyAdmin {
        processors[a] = true;
        emit RoleGranted("PROCESSOR",a);
    }

    function grantDistributor(address a) external onlyAdmin {
        distributors[a] = true;
        emit RoleGranted("DISTRIBUTOR",a);
    }

    function grantRetailer(address a) external onlyAdmin {
        retailers[a] = true;
        emit RoleGranted("RETAILER",a);
    }

    function grantCertifier(address a) external onlyAdmin {
        certifiers[a] = true;
        emit RoleGranted("CERTIFIER",a);
    }

    modifier onlyFarmer() {
        require(farmers[msg.sender],"ONLY_FARMER");
        _;
    }

    modifier onlyProcessor() {
        require(processors[msg.sender],"ONLY_PROCESSOR");
        _;
    }

    modifier onlyDistributor() {
        require(distributors[msg.sender],"ONLY_DISTRIBUTOR");
        _;
    }

    modifier onlyRetailer() {
        require(retailers[msg.sender],"ONLY_RETAILER");
        _;
    }

    modifier onlyCertifier() {
        require(certifiers[msg.sender],"ONLY_CERTIFIER");
        _;
    }

    function revokeFarmer(address a) external onlyAdmin {
        farmers[a] = false;
    }

    function revokeProcessor(address a) external onlyAdmin {
        processors[a] = false;
    }

    function revokeDistributor(address a) external onlyAdmin {
        distributors[a] = false;
    }

    function revokeRetailer(address a) external onlyAdmin {
        retailers[a] = false;
    }
    // =====================================================
    // FARM CERTIFICATION
    // =====================================================

    struct Farm {

        bytes32 certHash;

        uint256 validUntil;

        bool certified;
    }

    mapping(bytes32 => Farm) public farms;

    event FarmCertified(bytes32 farmId);

    function certifyFarm(
        bytes32 farmId,
        bytes32 certHash,
        uint256 validUntil
    )
        external
        onlyCertifier
    {

        farms[farmId] = Farm(
            certHash,
            validUntil,
            true
        );

        emit FarmCertified(farmId);
    }

    function updateFarmCertification(
        bytes32 farmId,
        bytes32 newHash,
        uint256 newValid
    )
        external
        onlyCertifier
    {
        Farm storage F = farms[farmId];

        require(F.certified,"NOT_CERTIFIED");

        F.certHash = newHash;

        F.validUntil = newValid;
    }   

    // =====================================================
    // LOT STRUCTURE
    // =====================================================

    enum Status {
        Created,
        Processed,
        Shipped,
        Sold,
        Flagged
    }

    enum Action {
        CREATE,
        PROCESS,
        SHIP,
        SELL,
        MERGE
    }

    struct History {

        Status status;

        address actor;

        uint256 time;
    }

    struct Lot {

        uint256 id;

        bytes32 farmId;

        address farmer;

        address owner;

        uint128 initialWeight;
        uint128 processedWeight;

        uint128 price;
        uint128 escrow;

        uint64 createdAt;
        uint64 updatedAt;

        Status status;

        bool flagged;

        bool escrowPaid;

        uint256[] sourceLots;
    }

    mapping(uint256 => Lot) public lots;


    // =====================================================
    // EVENTS
    // =====================================================

    event LotCreated(
        uint256 indexed lotId,
        address indexed farmer
    );

    event OwnershipTransferred(
        uint256 indexed lotId,
        address indexed from,
        address indexed to
    );

    event StatusChanged(
        uint256 indexed lotId,
        Status status
    );

    event PaymentReleased(
        uint256 indexed lotId,
        uint256 amount,
        address receiver
    );

    event LotMerged(uint256 newLot);

    event LotFlagged(uint256 lotId);

    event AuditLog(
        address indexed actor,
        uint256 indexed lotId,
        Action action
    );

    // =====================================================
    // INTERNAL
    // =====================================================

    function _mustLot(uint256 id)
        internal
        view
        returns(Lot storage)
    {
        require(lots[id].id != 0,"LOT_NOT_FOUND");
        return lots[id];
    }

    function _requireNotFlagged(Lot storage L)
        internal
        view
    {
        require(!L.flagged,"LOT_FLAGGED");
    }


    function _setStatus(
        Lot storage L,
        Status s
    )
        internal
    {

        L.status = s;

        L.updatedAt = uint64(block.timestamp);

        emit StatusChanged(L.id,s);
    }

    // =====================================================
    // CREATE LOT
    // =====================================================

    function createLot(
        uint256 id,
        bytes32 farmId,
        uint256 weight
    )
        external
        onlyFarmer
    {

        require(lots[id].id == 0,"LOT_EXISTS");

        Farm storage F = farms[farmId];

        require(F.certified,"FARM_NOT_CERTIFIED");

        require(
            block.timestamp <= F.validUntil,
            "CERT_EXPIRED"
        );

        Lot storage L = lots[id];

        L.id = id;

        L.farmId = farmId;

        L.farmer = msg.sender;

        L.owner = msg.sender;

        L.initialWeight = uint128(weight);

        L.status = Status.Created;

        L.createdAt = uint64(block.timestamp);

        L.updatedAt = uint64(block.timestamp);

        emit LotCreated(id,msg.sender);

        logAction(id,Action.CREATE);
    }

    // =====================================================
    // SET PRICE
    // =====================================================

    function setPrice(
        uint256 id,
        uint256 price
    )
        external
    {

        Lot storage L = _mustLot(id);

        require(L.owner == msg.sender);

        L.price = uint128(price);
    }

    // =====================================================
    // BUY LOT
    // =====================================================

    function buyLot(uint256 id)
        external
        payable
    {

        Lot storage L = _mustLot(id);

        _requireNotFlagged(L);

        require(msg.value >= L.price,"INSUFFICIENT_PAYMENT");

        address seller = L.owner;

        L.owner = msg.sender;

        L.escrow += uint128(msg.value);

        emit OwnershipTransferred(
            id,
            seller,
            msg.sender
        );
    }

    // =====================================================
    // PROCESS
    // =====================================================

    function processLot(
        uint256 id,
        uint256 processedWeight
    )
        external
        onlyProcessor
    {

        Lot storage L = _mustLot(id);

        _requireNotFlagged(L);

        require(L.owner == msg.sender);

        require(
            L.status == Status.Created,
            "BAD_STATUS"
        );

        L.processedWeight = uint128(processedWeight);

        _setStatus(
            L,
            Status.Processed
        );

        logAction(id,Action.PROCESS);
    }

    // =====================================================
    // SHIP
    // =====================================================

    function markShipped(uint256 id)
        external
        onlyDistributor
    {

        Lot storage L = _mustLot(id);

        _requireNotFlagged(L);

        require(L.owner == msg.sender);

        require(
            L.status == Status.Processed,
            "BAD_STATUS"
        );

        _setStatus(
            L,
            Status.Shipped
        );

        logAction(id,Action.SHIP);
    }

    function confirmReceived(uint256 id)
        external
        view
    {
        Lot storage L = _mustLot(id);

        require(L.owner == msg.sender);

        require(
            L.status == Status.Shipped,
            "BAD_STATUS"
        );
    }

    // =====================================================
    // SOLD
    // =====================================================

    function markSold(uint256 id)
        external
        onlyRetailer
    {

        Lot storage L = _mustLot(id);

        _requireNotFlagged(L);

        require(L.owner == msg.sender);

        require(
            L.status == Status.Shipped,
            "BAD_STATUS"
        );

        _setStatus(
            L,
            Status.Sold
        );

        _releaseEscrow(L);

        logAction(id,Action.SELL);
    }

    // =====================================================
    // ESCROW PAYMENT
    // =====================================================

    function _releaseEscrow(
        Lot storage L
    )
        internal
    {

        if(
            L.escrowPaid ||
            L.escrow == 0
        ) return;

        uint256 amount = L.escrow;

        L.escrowPaid = true;

        (bool ok,) = payable(L.farmer).call{value:amount}("");
        require(ok);

        emit PaymentReleased(
            L.id,
            amount,
            L.farmer
        );
    }

    function refundEscrow(uint256 id)
        external
        onlyAdmin
    {
        Lot storage L = _mustLot(id);

        require(!L.escrowPaid);

        uint256 amount = L.escrow;

        L.escrow = 0;

        (bool ok,) = payable(L.farmer).call{value:amount}("");
        require(ok);
    }

    // =====================================================
    // MERGE LOTS
    // =====================================================

    function mergeLots(
        uint256 newId,
        uint256[] calldata source
    )
        external
        onlyProcessor
    {

        require(lots[newId].id == 0,"LOT_EXISTS");

        uint256 total;

        for(uint i; i < source.length; ){

            Lot storage S = lots[source[i]];

            require(S.status == Status.Processed);
            require(S.owner == msg.sender);

            total += S.processedWeight;

            unchecked { ++i; }
        }

        Lot storage L = lots[newId];

        L.farmId = lots[source[0]].farmId;

        L.id = newId;

        L.owner = msg.sender;

        L.initialWeight = uint128(total);

        L.status = Status.Processed;

        L.sourceLots = source;

        L.createdAt = uint64(block.timestamp);
        L.updatedAt = uint64(block.timestamp);

        emit LotMerged(newId);

        logAction(newId,Action.MERGE);
    }

    // =====================================================
    // FLAG LOT
    // =====================================================

    function flagLot(uint256 id)
        external
        onlyAdmin
    {

        Lot storage L = _mustLot(id);

        L.flagged = true;

        L.status = Status.Flagged;

        emit LotFlagged(id);
    }

    event LotRecalled(uint256 lotId);

    function recallLot(uint256 id)
        external
        onlyAdmin
    {
        Lot storage L = _mustLot(id);

        L.flagged = true;

        L.status = Status.Flagged;

        emit LotRecalled(id);
    }

    // =====================================================
    // AUDIT LOG
    // =====================================================
    function logAction(
        uint256 id,
        Action action
    )
    internal
    {
        emit AuditLog(
            msg.sender,
            id,
            action
        );
    }

    // =====================================================
    // VIEW FUNCTIONS
    // =====================================================

    function getLot(uint256 id)
        external
        view
        returns(Lot memory)
    {
        return lots[id];
    }

}