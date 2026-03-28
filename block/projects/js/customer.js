(async () => {
  const batchId = "277386";

  const contract = window.getContract();
  const lot = await contract.getLot(batchId);

  const tx = await contract.buyLot(batchId, {
    value: lot.price
  });

  await tx.wait();

  console.log("TX:", tx.hash);

  await fetch(`http://localhost:3001/api/retailer/sell/${batchId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      txHash: tx.hash
    })
  });

  console.log("✅ DB updated");
})();