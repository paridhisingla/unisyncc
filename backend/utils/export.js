const { createObjectCsvWriter } = require('csv-writer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

async function exportToCSV(filePath, header, records) {
	const csvWriter = createObjectCsvWriter({ path: filePath, header });
	await csvWriter.writeRecords(records);
	return filePath;
}

function exportToExcel(filePath, sheets) {
	const wb = XLSX.utils.book_new();
	sheets.forEach(({ name, data }) => {
		const ws = XLSX.utils.json_to_sheet(data);
		XLSX.utils.book_append_sheet(wb, ws, name);
	});
	XLSX.writeFile(wb, filePath);
	return filePath;
}

function ensureDirExists(dir) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

function resolveExportPath(filename) {
	const dir = path.join(process.cwd(), 'exports');
	ensureDirExists(dir);
	return path.join(dir, filename);
}

module.exports = { exportToCSV, exportToExcel, resolveExportPath };


