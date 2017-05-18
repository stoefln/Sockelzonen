#!/usr/bin/env node
'use strict';
var meow = require('meow');
var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');
var util = require('util')
var outFile = 'geo_data.js';
const cli = meow(`
	Usage
	  $ csv2geoJson csvFilePath

	
	Examples
	  $ csv2geoJson myData.csv
`);

var inputFile = cli.input[0];
console.log("parsing "+ cli.input[0]+ "...");
if(typeof inputFile == 'undefined'){
	console.log("you have to specify the csv file path");
	return;
}

var features = [];
var geoJson = { 
	"type": "FeatureCollection",
    "features": features
};
var parser = parse({delimiter: ','}, function (err, data) {
  async.eachSeries(data, function (line, callback) {
  	console.log("line");
  	var coordinates = [];
  	line.forEach(function(v){
  		if(v != ""){
  			var xyz = v.split(';');
  			var xy = [
  				parseFloat(xyz[0]),
  				parseFloat(xyz[1])
  			];
  			console.log("lat/lng", xy);
  			coordinates.push(xy);
  		}
  	});
  	// A linear ring MUST follow the right-hand rule with respect to the area it bounds
  	// i.e., exterior rings are counterclockwise, and holes are clockwise.
  	coordinates.reverse();

  	var polygon = [];
  	polygon.push(coordinates);
  	// push more 
  	features.push(
			      { "type": "Feature",
			         "geometry": {
			           "type": "Polygon",
			           "coordinates": polygon
			         },
			         "properties": null
			     });
  	callback();
    
  })
});


fs.createReadStream(inputFile).pipe(parser).on('end', function () {
  //console.log("data parsed", util.inspect(geoJson, false, null));
  console.log("parsing done! writing file "+outFile+"...");
  fs.writeFile(outFile, "var creau = "+JSON.stringify(geoJson, null, 4)+";", function (err) {

    console.log("done");
  	if (err) 
  		return console.log(err);
  });
});

