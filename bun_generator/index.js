function new_seed() {
	const ret = xorshift64_randomize(Date.now());
	return Number(ret % 1000000n);
}

let own_url;
function update_seed(seed) {
	const new_url = own_url + '?seed=' + seed;
	history.replaceState({}, '', new_url);
}

let you_are_a, bun_name, new_bun;
function update_name(seed) {
	const bun = generate_using_xorshift64(seed);
	you_are_a.innerText = 'You are a';
	bun_name.innerText = bun;
}

function new_bun_clicked() {
	seed = new_seed();
	update_seed(seed);
	update_name(seed);
}

function start() {
	you_are_a = document.getElementById('you_are_a');
	bun_name = document.getElementById('bun_name');
	new_bun = document.getElementById('new_bun');
	
	preprocess_chain();
	
	const str_params = location.search;
	const href = location.href;
	own_url = href.substr(0, href.length - str_params.length);
	
	const params = new URLSearchParams(str_params);
	let seed = params.get('seed');
	if (seed === null) {
		seed = new_seed();
		update_seed(seed);
	}
	
	update_name(seed);
	
	new_bun.addEventListener('click', new_bun_clicked);
}

if (document.readyState === "loading")
	document.addEventListener('DOMContentLoaded', start);
else
	start();
