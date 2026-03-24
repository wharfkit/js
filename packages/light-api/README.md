# wharfkit-light-api

API client for the Light API service.

## Installing

```sh
yarn add wharfkit-light-api
```

## Usage

```ts
import {APIClient, FetchProvider} from '@wharfkit/antelope'
import {LightAPIClient} from 'wharfkit-light-api'

const client = new APIClient({
    provider: new FetchProvider('https://eos.light-api.net'),
})

const lightapi = new LightAPIClient(client)

const account = await lightapi.get_account('eos', 'teamgreymass')
const balances = await lightapi.get_balances('eos', 'teamgreymass')
const status = await lightapi.get_status()
```

## Running Tests

```sh
make test
```

Running tests against a live Light API server:

```sh
MOCK='overwrite' make test
```
