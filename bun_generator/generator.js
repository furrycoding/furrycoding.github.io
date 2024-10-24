start_node = 0;
end_node = -1;
markov_chain = [
	{'ch': 'B', 'tr': {1:1.0, 2:2.0, 3:1.0}},
	{'ch': 'h', 'tr': {3:1.0}},
	{'ch': 'u', 'tr': {2:1.0, 3:3.0}},
	{'ch': 'n', 'tr': {2:0.6, 3:1.5, 4:1.0, 5:1.0, 6: 2.0}},
	{'ch': 'h', 'tr': {3:1.0, 5:1.0, 6:1.0}},
	{'ch': 'u', 'tr': {3:1.0, 4:1.0, 6:1.0}},
	{'ch': 'y', 'tr': {7:1.0, '-1':2.0}},
	{'ch': 'u', 'tr': {6:1.0, '-1':1.0}},
];



function preprocess_chain() {
	for (const node of markov_chain) {
		const indices = [];
		
		// Calculate cumulative distribution function
		const probs = [];
		let sum = 0.0;
		for (const index in node.tr) {
			sum += node.tr[index];
			probs.push(sum);
			indices.push(parseInt(index)); // This language really is something...
		}
		
		// Normalize
		for (const i in probs)
			probs[i] /= sum;
		
		node.indices = indices;
		node.probs = probs;
	}
}

function generate(rand_func) {
	const max_length = 200;
	const ret = [];
	let cur_idx = start_node;
	while (cur_idx != end_node) {
		const node = markov_chain[cur_idx];
		//console.dir(node);
		ret.push(node.ch);
		
		const sample = rand_func();
		
		let next = null;
		for (const i in node.probs) {
			if (sample > node.probs[i])
				continue;
			next = node.indices[i];
			break;
		}
		
		if (next === null)  // Due to normalization, `node.probs` should always end with 1
			throw "bad bad should not happen";
		
		cur_idx = next;
		
		if (ret.length >= max_length)
			break;
	}
	
	return ret.join('');
}

// Requires BigInt support
function xorshift64_update(state) {
	let x = BigInt(state);
	x ^= x << 13n;
	x ^= x >> 7n;
	x ^= x << 17n;
	
	return BigInt.asUintN(64, x);
}

function xorshift64_randomize(state) {
	const tmp = BigInt.asUintN(4, xorshift64_update(state) >> 15n)
	const cnt = 3 + Number(tmp);
	for (let i = 0; i < cnt; i++)
		state = xorshift64_update(state);
	return state;
}

function uint64_to_number(val) {
	const x = BigInt.asUintN(30, val >> 10n);
	return Number(x) / (1 << 30);
}

function generate_using_xorshift64(seed) {
	let state = xorshift64_randomize(seed);
	
	if (state == 0) state = 1; // seed = 0 will cause this
	state = xorshift64_randomize(state);
	
	function rand_func() {
		state = xorshift64_randomize(state);
		state = xorshift64_update(state);
		const ret = xorshift64_randomize(state);
		return uint64_to_number(ret);
	}
	
	return generate(rand_func);
}


function stats(count) {
	const ret = {};
	for (let i = 0; i < count; i++) {
		const bun = generate_using_xorshift64(i);
		if (!(bun in ret))
			ret[bun] = 0;
		ret[bun]++;
	}
	return ret;
}
