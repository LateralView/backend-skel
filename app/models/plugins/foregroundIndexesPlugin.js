module.exports = (schema) => {
	// Build indexes in foreground for test environment
	if (process.env.NODE_ENV === 'test'){
		schema.indexes().forEach(function(index){
			index[1].background = false;
		});
	}
}
