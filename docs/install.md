# Install

**node:** `npm install {%= name %} --save`

    // instead of
    var check = require('check-types');
    // use this
    var check = require('{%= name %}');
    console.assert(check.bit(1), 'check.bit works');

**browser** `bower install {%= name %} --save`

    <script src="check-types.js"></script>
    <script src="{%= name %}.js"></script>
