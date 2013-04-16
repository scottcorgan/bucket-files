# Bucket List

Stream all files for a given bucket directory on Amazon S3

## Install

```
npm install bucket-files
```

## Usage

```javascript

var BucketFiles = require('bucket-files');
var bucketFiles = BucketFiles.connect({
  key: 's3-key',
  secret: 's3-secret'
  bucket: 'name-of-the-s3-bucket'
});


// Stream bucket files

var bucketStream = bucketFiles('folder_name');

bucketStream.on('data', function (fileData) {
  console.log(fileData);
});

bucketStream.on('end', function () {
  // all done streaming
});

```
