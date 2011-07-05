/**
 * @fileoverview astroObjectlib.js is a library of common objects for ASCOT gadgets.
 * @version 0.1
 *  Date: 2/10
 * @author Ian Smith (imsmith@uw.edu)
 */
 
// Create the UW.astro namspace
if (!UW) var UW={};

/**
 * Create a new CelestialCoordinate
 * @class Represents a celestial coordinate with such properties as RA, DEC, a placemark image,
 * a visibility, a description, and other fields.
 * @constructor
 * @param {string|number} ra The right ascention of the coordinate in decimal decrees (0 <= RA <= 360)
 * @param {string|number} dec The declination of the coordinate in decimal decrees (-90 <= DEC <= +90)
 */
UW.AstroMetaData = UW.AbstractModel.extend({
 
  initialize: function(){

    // URL string of the icon to represent this point (such as on the viewport)
    this.set( { color: "",
                infoText: "",  // string containing text info 
                name: "",
                description: "", // description text that is displayed in popup when a placemark is clicked 
                visible: true });
    this.bind('change', _(this.publishChange).bind(this));
  },
    

 setRa: function(newRa){
   this.set({ 'ra': parseFloat(newRa) });
   return this.get('ra');
 },

  /**
  * Set the declination of the point.
  * @param {string|number} newDec The DEC of the point in decimal degrees.
  * @return {number} The DEC of the point in decimal degrees (as number).
  */
  setDec: function(newDec){
    this.set({'dec': parseFloat(newDec)});
    return this.get('dec');
  },

 
/**
 * Parses a string that represents a coordinate to return a CelestialCoordinate
 * with the specified RA and DEC. The parser is supposed to be fairly tolerant, as it
 * will be translating from a web text input. The input can be in the form of HMS or decimal degrees.
 * @param {String} text Expects a coordinate repesented by RA and DEC in H M S or decimal degrees as <br/>
 *    00 00 00.0 +00 00 00.0  <br/>
 * or 00 00 00.0 -00 00 00.0  <br/>
 * or 00:00:00.0 +00:00:00.0  <br/>
 * or two decimal numbers     <br/>
 * where 0 is any digit.      <br/>
 * Decimals not required, but a + or - is required for the DEC.
 * @return {CelestialCoordinate} A CelestialCoordinate if text string represents an RA and DEC
 * otherwise returns null.
*/
// Note this is not a prototype function because we should be able to call it without making a new
// CelestialCoordinate
  parseCoord: function(text) {
    // try to split the string into ra and dec at +/-
    var isDecPositive = (text.indexOf('+') != -1);
    var splitRegex = /\+|\-/;
    var raDec = text.split(splitRegex);
    if (!(raDec.length === 2)) {
    	return false;
    }
    
    // split ra and dec at spaces
    var ra = tupleStrToDecimal(raDec[0]);
    var dec = tupleStrToDecimal(raDec[1]);
    if (ra === null || dec === null) {
	    return false;
    }
    if (!isDecPositive) {
	    dec = dec * -1;
    }
    if (!((ra >= 0) && (ra <= 360))) {
	    return false;
    }
    if (!(dec >= -90) && (dec <= 90)) {
    	return false;
    }
    
    this.set({'ra': ra, 'dec': dec});
    return true;
    
  },
  
  /**
   * Get "longitude" of this point. Longitude is simply RA-180 degrees.
   * This is the value that googlesky expects (-180 <= longitude <= +180)
   * @return {number} Return longitude of this point (RA-180)
   */
  getLongitude: function(){
    return this.get('ra') - 180;
  },

  /**
   * Get "latitude" of this point. Latitude is equivalent to DEC.
   * @return {number} Return the latitude of this point. 
   */
  getLatitude: function(){
    return this.get('dec');
  },

  setLongitude: function(newLongitude){
    this.set({'ra': parseFloat(newLongitude) + 180});
    return newLongitude;
  },
  
  setLatitude: function(newLatitude){
    this.set({'dec': newLatitude});
    return newLatitude;
  }
  
});

/**
 * @private 
 * @returns A decimal representation of the coordinate string
 * @param {String} A string representing 2 ints and a float, or just a single float
 */
function tupleStrToDecimal(str) {
    str = trim(str);
    var singleFoat = false;
    // split ra and dec at spaces
    var tupleStr = str.split(/ /); 
    if (!(tupleStr.length === 3)) {
	    tupleStr = str.split(/:/); // split ra and dec at colons
	    if (!(tupleStr.length === 3)) {
	        var tryFloat = parseFloat(tupleStr[0]); // maybe it's only a single decimal?
	        if (tupleStr.length === 1 && !isNaN(tryFloat)) {
    		    return tryFloat;
	        } else {
	    	    return null;
	        }
	    }
    }
    // test for whether the first 2 are ints, and the 3rd is a float
    var tupleNums = [];
    // specify radix of 10, beacuse 05  looks like octal 5
    tupleNums[0] = parseInt(tupleStr[0], 10);
    tupleNums[1] = parseInt(tupleStr[1], 10);
    tupleNums[2] = parseFloat(tupleStr[2], 10);
    // test for NaN in all 3 fields of both ra and dec
    for (var i=0; i<3; i++) {
    	if (isNaN(tupleNums[i])) {
	        return null;
	    }
    }
    // convert the 3 sections to decimal
    return tupleNums[0] + (tupleNums[1] / 60.0) + (tupleNums[2] / 3600.0);
}

// Helper
function trim(str) {
    return str.replace(/^\s+|\s+$/g,"");
}