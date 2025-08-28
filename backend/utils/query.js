function buildSearchQuery(search, fields = []) {
	if (!search || fields.length === 0) return {};
	const regex = new RegExp(search, 'i');
	return { $or: fields.map((f) => ({ [f]: regex })) };
}

module.exports = { buildSearchQuery };


