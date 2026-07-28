const MAX_TARBALL_BYTES = 400_000;

const agent = process.env.npm_config_user_agent ?? '';

if (agent.startsWith('bun')) {
	console.error(`
✖ Refusing to publish with bun.

  bun publish ignores the "files" field and would ship src/, .svelte-kit/,
  build/ and bun.lock — about 2.9 MB across 506 files.

  Use:  npm publish
`);
	process.exit(1);
}

const { execFileSync } = await import('node:child_process');

let packed;
try {
	// --ignore-scripts: prepack has not run yet, and `files` decides the list regardless of build state.
	const out = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'ignore']
	});
	packed = JSON.parse(out)[0];
} catch {
	console.error('✖ Could not run `npm pack --dry-run` to verify the tarball. Aborting.');
	process.exit(1);
}

const offenders = packed.files
	.map((f) => f.path)
	.filter((p) => /^(src|build|\.svelte-kit)\//.test(p) || p === 'bun.lock');

if (offenders.length > 0) {
	console.error(`✖ Tarball contains ${offenders.length} file(s) that must never ship:`);
	for (const p of offenders.slice(0, 5)) console.error(`    ${p}`);
	console.error('  The "files" field is not being honoured. Aborting.');
	process.exit(1);
}

if (packed.size > MAX_TARBALL_BYTES) {
	console.error(
		`✖ Tarball is ${packed.size} bytes (limit ${MAX_TARBALL_BYTES}). ` +
			`The "files" field is probably not being honoured. Aborting.`
	);
	process.exit(1);
}

console.error(
	`✔ Publish guard: ${(packed.size / 1024).toFixed(1)} kB, ${packed.files.length} files.`
);
