var fs = require('fs');

module.exports = {
  cached: null,
  getConfig: function() {

    var file;
    // Read the config file
    if (this.cached) {
      file = this.cached;
    } else {
      file = fs.readFileSync('config');
    }

    // Setup an array we'll use shortly
    var pairs = [];

    // Data comes out as a buffer, so stringify it
    file.toString()
    // Split it on newlines
    .split('\n')
    // Loop through each line
    .forEach(function(item) {

      // Ignore comments
      if (item.charAt(0) === '#') return;
      // Split the item on the `=`
      var pair = item.split('=');
      // Make sure the item has `=` in it
      if (!pair[1]) return;
      // Set the nth item in the pairs array to be key:value from 'key=value'
      pairs[item.split('=')[0]] = item.split('=')[1];
    });
    return pairs;
  }
};