# Sample Hardhat 3 Beta Project (`mocha` and `ethers`)

This project showcases a Hardhat 3 Beta project using `mocha` for tests and the `ethers` library for Ethereum interactions.

To learn more about the Hardhat 3 Beta, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3 Beta](https://hardhat.org/hardhat3-beta-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.

## Project Overview

This example project includes:

- A simple Hardhat configuration file.
- Foundry-compatible Solidity unit tests.
- TypeScript integration tests using `mocha` and ethers.js
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `mocha` tests:

```shell
npx hardhat test solidity
npx hardhat test mocha
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```


npm install @supabase/supabase-js ethers dotenv

npx hardhat run scripts/deploy.js --network localhost


Lúc nào cũng chạy cái này: npx hardhat node, lấy 1 bộ account & key thả vô env, cop xong không tắt terminal, mở terminal mới chạy node scripts/deploy.js 


npm install express cors tải server để api chạy bùm chéo



NHỚ LÚC NÀO CŨNG MỞ
npx hardhat node
node server.js


# Note của NAH (chạy web thì bắt đầu làm theo các bước sau)
Chỉ nhìn thư mục block (html,css,js) & backend
## Tạo 3 terninal chạy local
1. cd vô thư mục github --> chạy npx hardhat node
2. cd vô backend --> node server.js
3. cd vô github -->  npx hardhat run scripts/deploy.js --network localhost --> copy ví bỏ vô file connect.js

## Lấy ví của NAH để chạy, mở console import code trong setup.js vô để gán quyền (metamask popup 5 lần)

Muốn đăng nhập vào từng trang thì đổi địa chỉ ví trong metamask --> bấm connect ở trang main --> đăng xuất thì bấm home.

Phải theo flow từ cer --> farm --> pro --> dis -> retail, vì k có giao diện người dùng nên sau khi mua hàng xong ở role retailer thì mở console nhập code trong customer.js (thay batch_id cần mua) sẽ trả về sold.

## Truy xuất nguồn gốc thì nhập chain_batch_id trong trang truy xuất (vd: 331657)