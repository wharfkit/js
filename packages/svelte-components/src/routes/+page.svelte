<script lang="ts">
	import '../app.css';
	import { HR, Stack } from '$lib';
	import Selection from './sections/selection.svelte';
	import Forms from './sections/forms.svelte';
	import Typography from './sections/typography.svelte';
	import Layouts from './sections/layouts.svelte';
	import Codeblocks from './sections/codeblocks.svelte';
	import Buttons from './sections/buttons.svelte';
	import Cards from './sections/cards.svelte';
	import Chips from './sections/chips.svelte';
	import Loading from './sections/loading.svelte';
	import Expanding from './sections/expanding.svelte';
	import Tabular from './sections/tabular.svelte';
	import Toggles from './sections/toggles.svelte';
	import Inputs from './sections/inputs.svelte';
	import Elements from './sections/elements.svelte';
</script>

<Stack class="gap-12 *:scroll-m-4">
	<Typography />
	<HR />
	<Codeblocks />
	<HR />
	<Buttons />
	<HR />
	<Cards />
	<HR />
	<Chips />
	<HR />
	<Toggles />
	<HR />
	<Selection />
	<HR />
	<Inputs />
	<HR />
	<Loading />
	<HR />
	<Elements />
	<HR />
	<Expanding />
	<HR />
	<Tabular />
	<HR />
	<Forms />
	<HR />
	<Layouts />
</Stack>
