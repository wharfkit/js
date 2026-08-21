# Conformance

The conformance contract is a floating point oracle for Antelope SDKs. It holds a fixed grid of cases. Each case is an operation plus its operands. The chain computes every result. An SDK fetches the grid, recomputes each case in its own code, and compares its results with the stored results. When the two disagree, the chain is correct. The SDK then has a bug or a documented gap.

Three consumers drive the design. `@wharfkit/antelope` is the TypeScript SDK and the reference consumer. Its suite is `testnet/verify.ts`. `antelope-rs` is the Rust SDK. It records its own fixtures. `@greymass/vert` is the in-process wasm runtime for contract test suites. It loads the built artifacts of this repository and runs the grid without a node.

No case in the grid carries a hand-written expected value. The operands are constants in the contract source. The results come from `compute` on chain. A wrong expectation can only come from a wrong computation on the chain. The oracle exists to show that error, never to hide it.

## Deployment

The contract lives in the account `conform.gm` on Jungle 4. The endpoint is `https://jungle4.greymass.com`. `make testnet` deploys the contract. `make testnet/seed` fills the grid. The section "Deploying and seeding" gives the requirements. To see what a deployment holds, read the `version` singleton:

```bash
cleos -u https://jungle4.greymass.com get table conform.gm conform.gm version
```

The row carries five fields. `contract_version` is the `package.json` semver. `cdt_version` is the CDT release that produced the wasm. `grid_size` and `fq_start` describe the grid. `seeded_at` is the time of the last seed. A `seeded_at` of the unix epoch means that the grid is not seeded through to its last id. A consumer suite must treat that as an error and must not test a partial grid. `version` is a read-only action. You can also call it through `send_read_only_transaction` with no authorization and no resources.

The grid holds 2333 cases. `fq_start` is 1804.

## Naming

Antelope names permit only the characters `a-z`, `1-5`, and `.`, with a maximum of twelve characters. The digits 6, 7, 8, 9, and 0 are not available. An action cannot be called `f32add` or `to_i64`. Each op action is named `<width><op>`, with letter-only abbreviations for both parts.

| Prefix | Width | Origin |
|---|---|---|
| `fs` | float32 | nodeos intrinsic `printsf`, single precision |
| `fd` | float64 | nodeos intrinsic `printdf`, double precision |
| `fq` | float128 | nodeos intrinsic `printqf`, quadruple precision |

Integer widths are suffixes on the conversion ops. Each width has a signed and an unsigned form:

| Suffix | Integer type |
|---|---|
| `is` | int32 |
| `us` | uint32 |
| `il` | int64 |
| `ul` | uint64 |
| `ix` | int128 |
| `ux` | uint128 |

For example, `fdtoil` truncates a float64 to an int64. `fqfromus` converts a uint32 to a float128.

## Actions

Each op action is `[[eosio::read_only]]`. It returns a full `fp_case` struct built from its arguments, with `id` at 0 and `label` empty. The action fills the result column that matches its output type. All other columns keep their zero values. This makes a read-only reply comparable byte for byte with the stored row, after `id` and `label` are masked.

### Arithmetic

| Action | Arguments | Result column |
|---|---|---|
| `fsadd` | `a: float32, b: float32` | `r32` |
| `fssub` | `a: float32, b: float32` | `r32` |
| `fsmul` | `a: float32, b: float32` | `r32` |
| `fsdiv` | `a: float32, b: float32` | `r32` |
| `fdadd` | `a: float64, b: float64` | `r64` |
| `fdsub` | `a: float64, b: float64` | `r64` |
| `fdmul` | `a: float64, b: float64` | `r64` |
| `fddiv` | `a: float64, b: float64` | `r64` |
| `fqadd` | `a: float128, b: float128` | `r128` |
| `fqsub` | `a: float128, b: float128` | `r128` |
| `fqmul` | `a: float128, b: float128` | `r128` |
| `fqdiv` | `a: float128, b: float128` | `r128` |

### Minimum, maximum, and sign

| Action | Arguments | Result column |
|---|---|---|
| `fsmin` | `a: float32, b: float32` | `r32` |
| `fsmax` | `a: float32, b: float32` | `r32` |
| `fscopysign` | `a: float32, b: float32` | `r32` |
| `fdmin` | `a: float64, b: float64` | `r64` |
| `fdmax` | `a: float64, b: float64` | `r64` |
| `fdcopysign` | `a: float64, b: float64` | `r64` |

### Rounding

| Action | Arguments | Result column |
|---|---|---|
| `fsfloor` | `a: float32` | `r32` |
| `fsceil` | `a: float32` | `r32` |
| `fstrunc` | `a: float32` | `r32` |
| `fsnearest` | `a: float32` | `r32` |
| `fsround` | `a: float32` | `r32` |
| `fdfloor` | `a: float64` | `r64` |
| `fdceil` | `a: float64` | `r64` |
| `fdtrunc` | `a: float64` | `r64` |
| `fdnearest` | `a: float64` | `r64` |
| `fdround` | `a: float64` | `r64` |

### Unary

| Action | Arguments | Result column |
|---|---|---|
| `fssqrt` | `a: float32` | `r32` |
| `fsneg` | `a: float32` | `r32` |
| `fsabs` | `a: float32` | `r32` |
| `fdsqrt` | `a: float64` | `r64` |
| `fdneg` | `a: float64` | `r64` |
| `fdabs` | `a: float64` | `r64` |
| `fqneg` | `a: float128` | `r128` |

### Comparison

| Action | Arguments | Result column |
|---|---|---|
| `fseq` | `a: float32, b: float32` | `rb` |
| `fsne` | `a: float32, b: float32` | `rb` |
| `fslt` | `a: float32, b: float32` | `rb` |
| `fsle` | `a: float32, b: float32` | `rb` |
| `fsgt` | `a: float32, b: float32` | `rb` |
| `fsge` | `a: float32, b: float32` | `rb` |
| `fdeq` | `a: float64, b: float64` | `rb` |
| `fdne` | `a: float64, b: float64` | `rb` |
| `fdlt` | `a: float64, b: float64` | `rb` |
| `fdle` | `a: float64, b: float64` | `rb` |
| `fdgt` | `a: float64, b: float64` | `rb` |
| `fdge` | `a: float64, b: float64` | `rb` |
| `fqeq` | `a: float128, b: float128` | `rb` |
| `fqne` | `a: float128, b: float128` | `rb` |
| `fqlt` | `a: float128, b: float128` | `rb` |
| `fqle` | `a: float128, b: float128` | `rb` |
| `fqgt` | `a: float128, b: float128` | `rb` |
| `fqge` | `a: float128, b: float128` | `rb` |
| `fqunord` | `a: float128, b: float128` | `rb` |

`fqunord` is `__builtin_isunordered`. It is true when one or both operands are NaN. It is the one comparison that separates an unordered pair from a false ordering. Each ordered comparison returns false against a NaN, and `fqunord` shows that the pair was unordered.

### Width conversion

| Action | Arguments | Result column |
|---|---|---|
| `fstofd` | `a: float32` | `r64` |
| `fstofq` | `a: float32` | `r128` |
| `fdtofs` | `a: float64` | `r32` |
| `fdtofq` | `a: float64` | `r128` |
| `fqtofs` | `a: float128` | `r32` |
| `fqtofd` | `a: float128` | `r64` |

### To integer

| Action | Arguments | Result column |
|---|---|---|
| `fstois` | `a: float32` | `ri` |
| `fstous` | `a: float32` | `ri` |
| `fstoil` | `a: float32` | `ri` |
| `fstoul` | `a: float32` | `ri` |
| `fstoix` | `a: float32` | `rx` |
| `fstoux` | `a: float32` | `rx` |
| `fdtois` | `a: float64` | `ri` |
| `fdtous` | `a: float64` | `ri` |
| `fdtoil` | `a: float64` | `ri` |
| `fdtoul` | `a: float64` | `ri` |
| `fdtoix` | `a: float64` | `rx` |
| `fdtoux` | `a: float64` | `rx` |
| `fqtois` | `a: float128` | `ri` |
| `fqtous` | `a: float128` | `ri` |
| `fqtoil` | `a: float128` | `ri` |
| `fqtoul` | `a: float128` | `ri` |
| `fqtoix` | `a: float128` | `rx` |
| `fqtoux` | `a: float128` | `rx` |

Unsigned results are stored in the signed column as their bit pattern. For example, `fdtoul` of `1e19` lands in `ri` as a negative int64 with the same 64 bits. Read the column back as unsigned before you compare.

The to-integer actions trap when the argument is NaN or outside the range of the target integer. The wasm truncation instructions abort the transaction. A call such as `fdtous(-1)` fails with a hard abort and no diagnostic message. Each operand in the grid is inside the range of its target. If you probe values of your own, keep them in range.

### From integer

| Action | Arguments | Result column |
|---|---|---|
| `fsfromis` | `a: int32` | `r32` |
| `fsfromus` | `a: uint32` | `r32` |
| `fsfromil` | `a: int64` | `r32` |
| `fsfromul` | `a: uint64` | `r32` |
| `fdfromis` | `a: int32` | `r64` |
| `fdfromus` | `a: uint32` | `r64` |
| `fdfromil` | `a: int64` | `r64` |
| `fdfromul` | `a: uint64` | `r64` |
| `fdfromix` | `a: int128` | `r64` |
| `fdfromux` | `a: uint128` | `r64` |
| `fqfromis` | `a: int32` | `r128` |
| `fqfromus` | `a: uint32` | `r128` |
| `fqfromil` | `a: int64` | `r128` |
| `fqfromul` | `a: uint64` | `r128` |

The int128 sources stop at float64. CDT 4.1.1 permits `__floattidf` and `__floatuntidf`, so `fdfromix` and `fdfromux` exist. Its list of permitted intrinsics has no `__floattisf`, `__floatuntisf`, `__floattitf`, or `__floatuntitf`. As a result, `fsfromix`, `fsfromux`, `fqfromix`, and `fqfromux` cannot be built. Antelope has no int128 to float32 or int128 to float128 conversion that a contract can call. A conversion through an intermediate double was rejected. Double rounding can give a different result from a single correctly rounded conversion. An oracle that disagrees with the hardware it describes is worse than an oracle with a documented hole.

### Pass-through

| Action | Arguments | Result column |
|---|---|---|
| `fsecho` | `a: float32` | `r32` |
| `fdecho` | `a: float64` | `r64` |
| `fqecho` | `a: float128` | `r128` |

The echo actions carry a value through argument decoding, the `fp_case` struct, and return encoding without a change. This separates serialization defects from arithmetic defects.

### Scaled integer

| Action | Arguments | Result column |
|---|---|---|
| `fdtoamt` | `v: float64, precision: uint8` | `ri` and `r64` |
| `amttofd` | `units: int64, precision: uint8` | `r64` |

These two actions mirror the asset amount conversion that each SDK does when it turns `"1.2345 TOKEN"` into integer units and back. `fdtoamt` scales `v` by ten to the power of `precision` in a single multiply. It puts the truncated integer in `ri` and the value rounded half away from zero in `r64`. A suite can then see which of the two roundings its own code does. The single multiply matters. A scale by ten `precision` times rounds `precision` times. For operands whose scaled magnitude is more than 2^53, that gives a different result. `precision` is limited to the range 0 through 18.

### Table and admin

| Action | Arguments | Result |
|---|---|---|
| `version` | none | the `version_row` singleton |
| `fpcase` | `id: uint64` | the stored `fp_case` row with that id |
| `seed` | `from: uint32, to: uint32` | none |

`version` and `fpcase` are read-only. `seed` writes and needs the authority of the contract account. Debug artifacts add a `wipe` action. It also needs the authority of the contract account, and it empties both tables.

## Row schema

Each grid case is one row of the `fpcases` table, scoped to the contract account:

| Field | Type | Content |
|---|---|---|
| `id` | uint64 | Primary key, assigned in source order |
| `op` | name | The action that computed this row |
| `label` | string | Human-readable name of the source constant of the operand, for example `nan` or `2^53+1`, with a ` p<N>` suffix on the scaled-integer rows |
| `a32`, `b32` | float32 | Operands for `fs` ops |
| `r32` | float32 | Result for ops that produce a float32 |
| `a64`, `b64` | float64 | Operands for `fd` ops |
| `r64` | float64 | Result for ops that produce a float64 |
| `a128`, `b128` | float128 | Operands for `fq` ops |
| `r128` | float128 | Result for ops that produce a float128 |
| `ri` | int64 | Result for the 32-bit and 64-bit to-integer ops, the integer operand for the from-integer ops, the truncated result of `fdtoamt`, and the integer operand of `amttofd` |
| `ax` | int128 | Operand for `fdfromix` and `fdfromux` |
| `rx` | int128 | Result for the 128-bit to-integer ops |
| `rb` | bool | Result for the comparison ops |
| `by_f64` | float64 | Secondary index key, the `byfd` index |
| `by_f128` | float128 | Tertiary index key, the `byfq` index |

Columns that an op does not fill keep their zero value. This lets a read-only reply be compared byte for byte with the stored row.

`precision` is an argument of `fdtoamt` and `amttofd`. It is not a column of the row. The row carries it in the `label` as a ` p<N>` suffix. The row labeled `123456789.123456789 p9` is that operand at precision 9. The suffix is the only place where the row records `precision`. `testnet/args.ts` reads it with the regex `/ p(\d+)$/` when it rebuilds the action arguments. A consumer that replays the 24 scaled-integer rows reads `precision` from the label.

The `label` names the source constant of the operand. That constant is not always the operand that the row stores. At `fs` width, the stored operand is the constant rounded to float32. The `fsecho` row labeled `DBL_MAX` stores infinity. The row labeled `1e21` stores 1.0000000200408773e+21. On the unsigned from-integer rows, the label names the signed form of the same bit pattern. The row labeled `-1` converts 4294967295. The row labeled `INT64_MIN` converts 2^63. Each computed column describes the operand that the row stores. A suite compares the columns and reads the label as a name.

`by_f64` copies `r64` and `by_f128` copies `r128`, with one substitution. A NaN result is stored as zero. nodeos rejects NaN on each `db_idx_double` and `db_idx_long_double` host call. A row with a NaN result would fail to store. Rows with a NaN result are indexed at 0.0. An index query for zero finds them. An index query for their result does not.

`fq_start` is the id of the first case whose computation needs host intrinsics that off-chain wasm runtimes do not supply. The range opens at 1804 with `fstoix`, an int128 conversion that needs the `__fixsfti` family. The float128 block starts at 1898 and needs the `__*tf*` family. Each case below 1804 runs on any wasm host that implements the standard Antelope intrinsics. A host without the wide intrinsics seeds and tests `[0, fq_start)`. It leaves `[fq_start, grid_size)` to a real node.

## Consumer recipe

Each SDK suite does the same five steps. `testnet/verify.ts` is the reference implementation, written against `@wharfkit/antelope`. `make testnet/verify` runs it end to end against the deployed contract.

1. Pin the node, the contract, and the ABI. Read `version`. Make sure that its major version matches the version that the suite was written for. If `seeded_at` is the epoch, stop. Fetch the ABI with `get_abi`. Make sure that it has the action count the suite expects. `testnet/verify.ts` compares it with `build/conformance.abi`. A consumer with recorded fixtures decodes with the on-chain ABI that the fixtures were recorded against. A suite that compares against a stale deployment proves nothing. Record `server_version_string` from `get_info` with the results. Text formatting belongs to nodeos, and a node upgrade can change it without a change to the contract.
2. Fetch the grid twice. Page `get_table_rows` on `fpcases` with `json: true` until `more` is false. Then page it again with `json: false` to get the same rows as hex. The binary rows are the authority for values. The JSON rows are the subject of the text comparison.
3. Compare each row on three axes. Binary parity decodes the hex row with the on-chain ABI, encodes it again, and requires the same bytes. Text parity renders the decoded row field by field and compares it with the JSON from the node. It sorts the differences into two groups: differences that parse back to the same value, and differences that do not. Math parity recomputes the result from the operands in the arithmetic of the SDK and compares the bits. This keeps `-0.0`, NaN, and infinity separate.
4. Replay each row through its action. Build an action with the name in the `op` column of the row and the operands of the row. For `fdtoamt` and `amttofd`, take the `precision` argument from the ` p<N>` suffix of the `label`. Put a few dozen actions into one `send_read_only_transaction`. Make sure that each `return_value_hex_data` equals the stored row with `id` and `label` masked to their defaults. This step compares what the chain stored at seed time with what it computes on a fresh call. It also exercises the argument encoding of the SDK for each operand type.
5. Query the secondary indexes. Run `get_table_rows` against `byfd` with `key_type: 'float64'`. Run it against `byfq` with `key_type: 'float128'`, including an `encode_type: 'hex'` bound. Make sure that the node rejects a NaN bound. Index bound encoding is a separate serialization path from row decoding, and it has its own failure modes.

For step 3 and step 4, decode the binary rows. Do not reuse the objectified JSON rows. The JSON path loses float32 precision, and operands rebuilt from it do not round trip.

## Known SDK gaps

These differences are properties of the SDKs and of nodeos text formatting. They are not defects in this contract. `testnet/verify.ts` classifies the text differences as known gaps. It passes the run when binary and math parity hold.

1. **Float text formatting.** nodeos formats each float through `fc` with `setprecision(17) << fixed` inside a quoted string. `0.1` renders as `"0.10000000000000001"`, `5.0` as `"5.00000000000000000"`, and `1e-20` as `"0.00000000000000000"`. `std::fixed` counts digits after the decimal point, so the text loses significant digits as the magnitude decreases. Each value below 1e-17 renders as zero. `@wharfkit/antelope` emits the shortest text that parses back to the same value. Most differences parse back to the same value. The rest are values that the node rendered with too few digits. The node is the lossy side of this gap.
2. **float32 text in JSON.** `fc` widens a float32 to double before it formats, so `0.1f` renders as `"0.10000000149011612"`. Small float32 values lose digits in the same way as float64 values. `1e-9f` renders as `"0.00000000099999997"`, which does not parse back to the stored float32. Consumers must not read float32 conformance values from `get_table_rows` JSON. Decode the binary rows, or call the read-only action and use the decoded `Float32` from its return value.
3. **NaN and infinity spelling.** nodeos emits `nan`, `-nan`, `inf`, and `-inf`. It accepts the JavaScript spellings on input through `boost::lexical_cast`. `@wharfkit/antelope` emits the nodeos spellings and parses both. An SDK that emits `NaN` or `Infinity` differs in text and loses the sign of a NaN.
4. **The default NaN is negative.** nodeos computes with Berkeley SoftFloat in its 8086-SSE form. A NaN that an operation creates, for example `0/0` or `sqrt(-1)`, has the sign bit set: `0xffc00000` for float32 and `0xfff8000000000000` for float64. A NaN that an operation propagates keeps the bits of its operand. An SDK that stores a NaN as a native number cannot keep those bits. `@wharfkit/antelope` keeps the decoded bytes of a NaN and encodes a NaN without bytes as the negative default. JavaScriptCore canonicalizes a NaN that passes through a number. V8 does not. An SDK test can pass on one engine and fail on the other.
5. **float32 intermediate precision.** JavaScript numbers are doubles. An SDK can compute a float32 result in a double and round once at the end. For a single add, subtract, multiply, divide, or square root, that gives the correct binary32 result. The `@wharfkit/antelope` consumer suite recomputes each `fs` row this way with `Math.fround` and matches the contract bit for bit. A chain of float32 operations without a `Math.fround` after each step can disagree, because the double keeps bits that binary32 discards. The grid has one operation per row, so it shows the per-operation result and leaves chains to the SDK.
6. **float128 arithmetic.** `@wharfkit/antelope` and vert do not implement binary128 arithmetic. Consumers compare the sixteen bytes of `a128`, `b128`, and `r128`. They mark those cases pending instead of recomputing them.
7. **`fmin` and `fmax` semantics.** `__builtin_fmin` and `__builtin_fmax` in the contract have the C library semantics. When one operand is NaN, the result is the other operand. `-0.0` orders below `+0.0`. The wasm instructions `f32.min`, `f64.min`, `f32.max`, and `f64.max` differ: they return NaN when either operand is NaN. The grid carries the `{nan, 1}`, `{1, nan}`, and `{-0, 0}` operand pairs. A suite that uses the wasm semantics sees the disagreement on the first run instead of in a user report.
8. **`nearest` against `round`.** `fsnearest` and `fdnearest` are wasm `f32.nearest` and `f64.nearest`. They round half to even: 0.5 becomes 0.0 and 2.5 becomes 2.0. `fsround` and `fdround` are the C library `round`. They round half away from zero: 0.5 becomes 1.0 and 2.5 becomes 3.0. Both are recorded over the same operand pool. A suite that uses one rounding for both can see the difference.

Two limitations belong to vert. It throws `Not implemented` on each `__*tf*` intrinsic. This is why the range from `fq_start` upward cannot be seeded in-process. It also ships the ten `db_idx_long_double_*` host functions commented out (`src/antelope/vm.ts:1004-1016`). A contract with a float128 secondary index fails to link before any action runs. `test/helpers.ts` in this repository patches `WebAssembly.instantiate` to supply them as stubs that return `-1`. Each other vert-based consumer of this contract needs the same shim until vert ships the real host calls.

## Building and testing

Docker is required. The contract is built with CDT 4.1.1 inside a `linux/amd64` image, so each machine produces the same wasm. `make docker/image` builds that image. Both build targets depend on it. `docker build` runs on each build and uses the layer cache of Docker to stay fast. On Apple Silicon, the image runs under emulation, and a build takes minutes.

```bash
make                  # build production artifacts into build/
make build/debug      # build debug artifacts, which add the wipe action
make test             # build debug, generate the codegen client, run the bun suite under vert
make check            # clang-format on C++ sources, eslint on TS sources
make format           # apply both formatters in place
make codegen          # regenerate codegen/conformance.ts from the debug ABI
```

`build/conformance.wasm` and `build/conformance.abi` are committed. Consumers load them. `make testnet` deploys them. `testnet/verify.ts` compares the on-chain ABI with them. They must match the source in the same commit. CI rebuilds them and fails on `git diff --exit-code`. A source change without a rebuild turns the branch red. Debug artifacts and `codegen/` are generated and ignored.

The bun suite runs against vert and seeds `[0, fq_start)` in-process. It covers the grid boundaries, the version row, each `fs` and `fd` op action below `fq_start`, and the helpers that `testnet/verify.ts` uses to rebuild arguments. Six `fs` and `fd` op actions sit above `fq_start` and are outside its reach: `fstoix`, `fstoux`, `fdtoix`, `fdtoux`, `fdfromix`, and `fdfromux`. All six need the int128 intrinsics that vert does not have. `make testnet/verify` exercises those six and each case at or above `fq_start` on chain.

## Deploying and seeding

A `cleos` wallet on the machine that runs these targets holds the active key of the account. This repository stores no private key. Unlock the wallet first:

```bash
cleos wallet unlock
make testnet          # cleos set contract, deploying build/conformance.{wasm,abi}
make testnet/seed     # push seed in slices until the whole grid is stored
make testnet/verify   # run testnet/verify.ts against the deployed contract
```

`make testnet/seed` reads `grid_size` from the chain and walks the grid in slices. The default slice is 40 ids per transaction. Two variables tune it. `SEED_STEP` sets the slice size. `SEED_FROM` resumes from an id after a failure, for example `make testnet/seed SEED_FROM=1200 SEED_STEP=25`. A slice must fit inside the CPU budget of the account. The float128 cases at the top of the grid cost more than the float32 cases at the bottom. A step that works at id 0 can need to shrink near `fq_start`. The seed is idempotent. An id that is already stored is overwritten with the same computed values, so a slice is safe to run again. `seeded_at` is stamped only when a slice reaches the last id.

The account needs about 1.4 MB of RAM. That figure comes from nodeos billing, not from the row payload alone. Each row is about 180 bytes of `fp_case` data. The `key_value_object` that holds the row adds 108 bytes. The entry in the `byfd` float64 index adds 128 bytes. The entry in the `byfq` float128 index adds 136 bytes. nodeos bills 32 bytes of overhead per row per index on top of the size of each object. That is about 552 bytes per row, so 2333 rows come to about 1,258 KB. The contract adds 188 KB of wasm and ABI. Provision with margin above 1.4 MB. Give the account enough staked CPU and NET to push about sixty seed transactions.

`.env` sets the endpoint and the account through `TESTNET_NODE_URL` and `CONFORMANCE_TESTNET_ACCOUNT`. The Makefile exports both to `cleos` and to the bun scripts. `testnet/verify.ts` needs an endpoint that executes read-only transactions. If the endpoint does not, the script reports an explicit error.

## Versioning

The contract version is the `package.json` semver. It is compiled into the wasm and shown through the `version` table.

- **Patch** for a re-seed or a change that leaves the grid identical, such as a CDT upgrade or a build fix.
- **Minor** when cases or whole op families are appended and each existing id is untouched. A suite pinned to the previous minor version passes on the ids it knows.
- **Major** when an existing row changes meaning, or when the `fp_case` schema changes.

Ids are assigned in source order and are never renumbered. A removed case leaves its id as a gap. The ids above it do not shift, so a recorded fixture stays addressable. Consumer suites make sure that the major version matches, and they record the full version string with their results. A difference that appears after an upgrade must be attributable to a specific build.

## License

BSD-3-Clause. Copyright Greymass Inc.
