"use strict";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AWS = require('aws-sdk');
var s3 = new AWS.S3({
apiVersion: '2012–09–25'
});

var eltr = new AWS.ElasticTranscoder({
apiVersion: '2012–09–25',
region: 'us-east-1'
});
exports.handler = function(event, context) {
console.log('Executing Elastic Transcoder');
var bucket = event.Records[0].s3.bucket.name;
var key = event.Records[0].s3.object.key;
var pipelineId = '1681633810433-qxaif4';
if (bucket !== 'transcode-src-31534') {
context.fail('Incorrect Input Bucket');
return;
}
var srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
//the object may have spaces
var newKey = key.split('.')[0];
var fk= "400K";
var sk= "600K";
var om= "1.5M";
var tm= "2M";
var th= "Thumb"
var params = {
PipelineId: pipelineId,
OutputKeyPrefix: newKey + '/',
Input: {
Key: srcKey,
FrameRate: 'auto',
Resolution: 'auto',
AspectRatio: 'auto',
Interlaced: 'auto',
Container: 'auto'
},
Outputs: [{
Key: fk + '/' +'hls4K-' + newKey + '.ts',

ThumbnailPattern: th +'/'+'thumbs4K-{count}',
PresetId: '1680065140804-2rphju',//HLS v3 400K/s
SegmentDuration:'5'
},
{
Key: sk + '/' +'hls6K-' + newKey + '.ts',
ThumbnailPattern: th +'/'+'thumbs6K-{count}',
PresetId: '1681634388890-e6lhtp', //HLS v3 600K/s
SegmentDuration:"5"
},
{
Key: om + '/' +'hls1.5M-' + newKey + '.ts',
ThumbnailPattern: th +'/'+'thumbs1.5M-{count}',
PresetId: '1681634438166-irl4u2', //HLS v3 1.5M/s
SegmentDuration:"5"
},,
{
Key: tm + '/' +'hls2M-' + newKey + '.ts',
ThumbnailPattern: th +'/'+'thumbs2M-{count}',
PresetId: '1681634618275-3l687p', //HLS v3 2M/s
SegmentDuration:"5"
}
],
Playlists: [{
Format: 'HLSv3',
Name: 'hls-'+ newKey,
OutputKeys: [ fk+ '/' +'hls4K-'+ newKey + '.ts',sk + '/' +'hls6K-' + newKey + '.ts',om + '/'
+'hls1.5M-' + newKey + '.ts',,tm + '/' +'hls2M-' + newKey + '.ts']
}]
};
console.log('Starting Job');
eltr.createJob(params, function(err, data){
if (err){
console.log(err);
} else {
console.log(data);
}
context.succeed('Job well done');
});
};
