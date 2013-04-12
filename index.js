var assert = require('assert');
var async = require('async');
var aws2js = require('aws2js');
var Stream = require('stream');
var BucketList = require('bucket-list');

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
    
    var s3 = aws2js.load("s3", opts.key, opts.secret);
    var bucket = BucketList.connect(opts);
    var stream = new Stream();
    
    //
    s3.setBucket(opts.bucket);
    stream.readable = true
    
    var bucketStream = bucket(path);
    var fileCounter = 0;
    
    bucketStream.on('data', function (file) {
      fileCounter += 1;
      
      s3.get(file, 'stream', function (err, s3File) {
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
}