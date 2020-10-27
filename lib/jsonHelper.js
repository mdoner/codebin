const fs = require('fs');

module.exports = {
	readFile: function(path, fileName) {
		if (fileName.endsWith('.css') || fileName.endsWith('.js')) return;
		if(fileName.endsWith('.json')) fileName = fileName.slice(0,-5);
		let raw = fs.readFileSync(`${path}/${fileName}.json`);
		return JSON.parse(raw);
	},
	writeFile: function(path, fileName, data) {
		if(fileName.endsWith('.json')) fileName = fileName.slice(0,-5);
		writeData = JSON.stringify(data);
		fs.writeFileSync(`${path}/${fileName}.json`, writeData);
	},
	writeFileNext: function(path, fileName, data, next) {
		if(fileName.endsWith('.json')) fileName = fileName.slice(0,-5);
		writeData = JSON.stringify(data);
		fs.writeFileSync(`${path}/${fileName}.json`, writeData);
		next();
	},
	exists: function(path, fileName) {
		if(fileName.endsWith('.json')) fileName = fileName.slice(0,-5);
		return fs.existsSync(path + '/' + fileName + '.json');
	},
	deleteFile: function(path, fileName) {
		if(fileName.endsWith('.json')) fileName = fileName.slice(0,-5);
		fs.unlinkSync(`${path}/${fileName}.json`);
	}
};
