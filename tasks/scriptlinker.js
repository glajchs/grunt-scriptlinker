/*
 * grunt-scriptlinker
 * https://github.com/scott-laursen/grunt-scriptlinker
 *
 * Copyright (c) 2013 scott-laursen
 * Licensed under the MIT license.
 */

'use strict';

var util = require('util');

module.exports = function(grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	grunt.registerMultiTask('sails-linker', 'Your task description goes here.', function() {
		// Merge task-specific and/or target-specific options with these defaults.
		var options = this.options({
			startTag: '<!--SCRIPTS-->',
			endTag: '<!--SCRIPTS END-->',
			fileTmpl: '<script src="%s"></script>',
			appRoot: '',
            removeStartEndTags: false
		});


		// Iterate over all specified file groups.
		this.files.forEach(function (f) {
			var scripts = '',
				page = '',
				newPage = '',
				start = -1,
				end = -1,
				lastScriptPath = '';

			// Create string tags
			scripts = f.src.filter(function (filepath) {
					// Warn on and remove invalid source files (if nonull was set).
					if (!grunt.file.exists(filepath)) {
						grunt.log.warn('Source file "' + filepath + '" not found.');
						return false;
					} else { return true; }
				});
			lastScriptPath = scripts[scripts.length - 1];
			scripts = scripts.map(function (filepath) {
					return util.format(options.fileTmpl, filepath.replace(options.appRoot, ''));
				});

			if (typeof options.fileTmplLast === "string") {
				scripts[scripts.length - 1] = util.format(options.fileTmplLast, lastScriptPath.replace(options.appRoot, ''));
			}

			grunt.file.expand({}, f.dest).forEach(function(dest){
				page = grunt.file.read(dest);
				start = page.indexOf(options.startTag);

				end = page.indexOf(options.endTag);
				if (start === -1 || end === -1 || start >= end) {
					return;
				} else {
          var padding ='';
          var ind = start - 1;
          // TODO: Fix this hack
          while(page.charAt(ind)===' ' || page.charAt(ind)==='  '){
            padding += page.charAt(ind);
            ind -= 1;
          }
                    if (options.removeStartEndTags) {
                        newPage = page.substr(0, start) + scripts.join('\n'+padding) + page.substr(end + options.endTag.length);
                    } else {
                        newPage = page.substr(0, start + options.startTag.length)+'\n' + padding + scripts.join('\n'+padding) + '\n' + padding + page.substr(end);
                    }
					// Insert the scripts
					grunt.file.write(dest, newPage);
					grunt.log.writeln('File "' + dest + '" updated.');
				}
			});
		});
	});

};
