var assert = require('assert');
var async = require('async');
var Stream = require('stream');
var BucketList = require('bucket-list');
var knox = require('knox');

exports.connect = function (opts) {
  assert.ok(opts, 'AWS S3 options must be defined.');
  assert.notEqual(opts.key, undefined, 'Requires S3 AWS Key.');
  assert.notEqual(opts.secret, undefined, 'Requres S3 AWS Secret');
  assert.notEqual(opts.bucket, undefined, 'Requires AWS S3 bucket name.');
  
  //
  return function (path, callback) {
    if (!path) {
      return null;
    }
    
    var bucket = BucketList.connect(opts);
    var stream = new Stream();
    
    stream.readable = true
    
    var client = knox.createClient({
      key: opts.key,
      secret: opts.secret,
      bucket: opts.bucket
    });
    
    var bucketStream = bucket(path);
    var fileCounter = 0;
    
    bucketStream.on('data', function (file) {
      fileCounter += 1;
      
      client.get(file).on('response', function (s3File) {
        if (err) {
          stream.emit('error', err);
          stream.emit('end');
          return;
        }
        
        stream.emit('data', {
          path: file.replace(path, ''),
          data: s3File
        });
        
        s3File.on('end', function () {
          fileCounter -= 1;
          
          if (fileCounter < 1) {
            stream.emit('end');
          }
        });
      });
    });
    
    return stream;
  };
};