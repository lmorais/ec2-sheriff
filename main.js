var AWS = require('aws-sdk');
var argv = require('yargs')
  .array('tags')
  .argv;

var config = new AWS.Config({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: argv.region || process.env.AWS_REGION
});

var ec2 = new AWS.EC2(config);

var describeInstanceParams = {
  Filters: [
    {
      Name: 'instance-state-name',
      Values: [
        'running'
      ]
    },
    {
      Name: 'tag-value',
      Values: argv.tags
    }
  ]
};


var instanceIds = [];

ec2.describeInstances(describeInstanceParams, function(err, data) {
  if (err)
    console.log(err, err.stack);
  else
    data.Reservations.forEach(function(item){
      item.Instances.forEach(function(instance){
        instanceIds.push(instance.InstanceId)
      })
    })

    var stopInstanceParams = {
      InstanceIds: instanceIds
    }

    if(stopInstanceParams.InstanceIds.length === 0)
      console.log("Instance stop failed: Doesn't any running machines with instanceId or this is null.");
    else
      ec2.stopInstances(stopInstanceParams, function(err, data) {
        if (err) 
          console.log("Error", err);
        else
          console.log("Success", data.StoppingInstances);
      });

});