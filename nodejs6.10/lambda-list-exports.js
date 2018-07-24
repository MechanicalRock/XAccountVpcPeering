let AWS = require ('aws-sdk')
exports.handler =  function(event, context, callback) {
    let exportName = event.Name
    if ( exportName === undefined || exportName.length == 0 ) {
        callback(new Error("Export 'Name' parameter is required"))
    }

    let cfn =  new AWS.CloudFormation()
    let maybeExports = cfn.listExports().promise()
    maybeExports
      .then( (response) => {
        let exports = response.Exports.filter( (it) => it.Name == exportName)
        if ( exports.length == 1 ) {
          callback(null,exports.pop())
        } else {
          callback(new Error("Could not find export - "+exportName))    
        }
      })
      .catch( (err) => {
        callback(new Error(err))
    })
}

