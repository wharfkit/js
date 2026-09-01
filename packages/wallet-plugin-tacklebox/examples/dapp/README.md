# Example dapp

A minimal browser dapp for exercising the plugin against a real TackleBox build:
login, a self-transfer, session restore and logout.

```bash
# from the repository root: build the plugin first
npm install

# then run the example
cd examples/dapp
npm install
npm run dev
```

Open the printed URL, click **Login**, copy the request from the modal and paste it into
TackleBox under **Contracts → ESR → CONNECT AS LOGIN**. After that, **Transfer to self**
pushes a signing request straight into the wallet over the link channel — approve it in
TackleBox's review modal, or whitelist `eosio.token::transfer` for the account with a
pinned auto-sign rule to watch it complete with no wallet interaction at all.

Jungle4 testnet is the first chain in the list — a throwaway jungle4 account is the
safest way to run the full flow.
