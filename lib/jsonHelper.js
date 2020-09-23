const fs = require('fs');

module.exports = {
	readFile: function(path, fileName) {
		if (fileName.endsWith('.css') || fileName.endsWith('.js')) return;
		let raw = fs.readFileSync(`${path}/${fileName}.json`);
		return JSON.parse(raw);
	},
	writeFile: function(path, fileName, data) {
		writeData = JSON.stringify(data);
		fs.writeFileSync(`${path}/${fileName}.json`, writeData);
	},
	writeFileNext: function(path, fileName, data, next) {
		writeData = JSON.stringify(data);
		fs.writeFileSync(`${path}/${fileName}.json`, writeData);
		next();
	},
	exists: function(path, fileName) {
		return fs.existsSync(path + '/' + fileName + '.json');
	},
	deleteFile: function(path, fileName) {
		fs.unlinkSync(`${path}/${fileName}.json`);
	}
};
