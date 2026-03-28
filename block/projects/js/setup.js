async function setupRoles() {
  const c = window.getContract();

  const farmer = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
  const processor = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
  const distributor = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc";
  const certifier = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
  const retailer = "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65";

  console.log("🚀 Granting roles...");

  await (await c.grantFarmer(farmer)).wait();
  await (await c.grantProcessor(processor)).wait();
  await (await c.grantDistributor(distributor)).wait();
  await (await c.grantCertifier(certifier)).wait();
  await (await c.grantRetailer(retailer)).wait();

  console.log("✅ DONE");
}

setupRoles();