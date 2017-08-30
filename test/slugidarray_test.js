var subject = require("../lib/entity")
var assert  = require('assert');
var slugid  = require('slugid');
var _       = require('lodash');
var Promise = require('promise');
var crypto  = require('crypto');
var helper  = require('./helper');

var Item = subject.configure({
  version:          1,
  partitionKey:     subject.keys.StringKey('id'),
  rowKey:           subject.keys.StringKey('name'),
  properties: {
    id:             subject.types.String,
    name:           subject.types.String,
    data:           subject.types.SlugIdArray
  }
});

helper.contextualSuites("Entity (SlugIDArrayType)", helper.makeContexts(Item),
function(context, options) {
  var Item = options.Item;

  setup(function() {
    return Item.ensureTable();
  });

  test("SlugIdArray.push", function() {
    var arr = subject.types.SlugIdArray.create();
    var id = slugid.v4();
    arr.push(id);
  });

  test("SlugIdArray.toArray", function() {
    const slugArray = subject.types.SlugIdArray.create();
    const slug1 = slugid.v4();
    const slug2 = slugid.v4();

    slugArray.push(slug1);
    slugArray.push(slug2);

    const arr = slugArray.toArray();

    assert(slug1 === arr[0], `Expected ${slug1}`);
    assert(slug2 === arr[1], `Expected ${slug2}`);
  });

  test("SlugIdArray.toArray (with 1k ids)", function() {
    const slugArray = subject.types.SlugIdArray.create();
    const N = 1000;
    let slugids = [];

    for (let i = 0; i < N; i++) {
      const id = slugid.v4();

      slugArray.push(id);
      slugids.push(id)
    }

    const result = slugArray.toArray();

    for (let i = 0; i < N; i++) {
      assert(slugids[i] === result[i], `Expected ${slugids[i]}`);
    }
  });

  test("SlugIdArray.push (with 1k ids)", function() {
    var arr = subject.types.SlugIdArray.create();
    for(var i = 0; i < 1000; i++) {
      arr.push(slugid.v4());
    }
  });

  test("SlugIdArray.indexOf", function() {
    var arr = subject.types.SlugIdArray.create();
    var id = slugid.v4();
    arr.push(id);
    assert(arr.indexOf(id) !== -1);
  });

  test("SlugIdArray.indexOf (with 1k ids)", function() {
    var arr = subject.types.SlugIdArray.create();
    var list = [];
    for(var i = 0; i < 1000; i++) {
      var id = slugid.v4();
      list.push(id);
      arr.push(id);
    }
    list.forEach(function(id) {
      assert(arr.indexOf(id) !== -1, "Expected slugid to be present in array");
    });
    for(var i = 0; i < 1000; i++) {
      var id = slugid.v4();
      assert(arr.indexOf(id) === list.indexOf(id),
             "Slugid present but not pushed!!");
    }
  });

  test("SlugIdArray.remove", function() {
    var arr = subject.types.SlugIdArray.create();
    var list = [];
    for(var i = 0; i < 1000; i++) {
      var id = slugid.v4();
      list.push(id);
      arr.push(id);
    }
    list.forEach(function(id) {
      assert(arr.remove(id), "Expected slugid to be present");
    });
    list.forEach(function(id) {
      assert(arr.indexOf(id) === -1, "Expected slugid to be removed");
    });
  });

  test("SlugIdArray.clone", function() {
    var arr = subject.types.SlugIdArray.create();
    for(var i = 0; i < 200; i++) {
      arr.push(slugid.v4());
    }
    var arr2 = arr.clone();
    assert(arr.equals(arr2));

    var id = slugid.v4();
    arr.push(id);
    var id2 = slugid.v4();
    arr2.push(id2);

    assert(arr.indexOf(id) !== -1, "id in arr");
    assert(arr.indexOf(id2) === -1, "id2 not in arr");
    assert(arr2.indexOf(id) === -1, "id not in arr2");
    assert(arr2.indexOf(id2) !== -1, "id2 in arr2");
    assert(!arr.equals(arr2));
  });

  test("SlugIdArray.equals (with 1k ids)", function() {
    var arr = subject.types.SlugIdArray.create();
    var arr2 = subject.types.SlugIdArray.create();
    for(var i = 0; i < 1000; i++) {
      var id = slugid.v4();
      arr.push(id);
      arr2.push(id);
    }
    assert(arr.equals(arr2));
  });

  // Generate random slugIdArrays
  var randomSlugIdArray = function(length) {
    var arr = subject.types.SlugIdArray.create();
    for (var i = 0; i < length; i++) {
      arr.push(slugid.v4());
    }
    return arr;
  };

  test("small slugid array", function() {
    var id    = slugid.v4();
    var arr   = randomSlugIdArray(42);
    return Item.create({
      id:     id,
      name:   'my-test-item',
      data:   arr
    }).then(function(itemA) {
      return Item.load({
        id:     id,
        name:   'my-test-item'
      }).then(function(itemB) {
        assert(itemA.data.equals(itemB.data));
        assert(itemA.data.equals(arr));
      });
    });
  });


  test("large slugid array (4k ids, 64kb)", function() {
    var id    = slugid.v4();
    var arr   = randomSlugIdArray(4 * 1024);
    return Item.create({
      id:     id,
      name:   'my-test-item',
      data:   arr
    }).then(function(itemA) {
      return Item.load({
        id:     id,
        name:   'my-test-item'
      }).then(function(itemB) {
        assert(itemA.data.equals(itemB.data));
        assert(itemA.data.equals(arr));
      });
    });
  });

  test("large slugid array (8k ids, 128kb)", function() {
    var id    = slugid.v4();
    var arr   = randomSlugIdArray(8 * 1024);
    return Item.create({
      id:     id,
      name:   'my-test-item',
      data:   arr
    }).then(function(itemA) {
      return Item.load({
        id:     id,
        name:   'my-test-item'
      }).then(function(itemB) {
        assert(itemA.data.equals(itemB.data));
        assert(itemA.data.equals(arr));
      });
    });
  });

  test("large slugid array (16k ids, 256kb)", function() {
    var id    = slugid.v4();
    var arr   = randomSlugIdArray(16 * 1024);
    return Item.create({
      id:     id,
      name:   'my-test-item',
      data:   arr
    }).then(function(itemA) {
      return Item.load({
        id:     id,
        name:   'my-test-item'
      }).then(function(itemB) {
        assert(itemA.data.equals(itemB.data));
        assert(itemA.data.equals(arr));
      });
    });
  });
});
