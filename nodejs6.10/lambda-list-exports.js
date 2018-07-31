let cfnResponse = require('cfn-response')
let AWS = require ('aws-sdk')

const find = (cfn, exportName, nextToken)=> {
  return cfn.listExports({ NextToken: nextToken }).promise().then( (response) => {
    let moreResults = response.NextToken
    let exports = response.Exports.filter( (it) => it.Name == exportName) 
    if( exports.length > 0 ){
      return exports.pop()
    }else if (moreResults){
      return find(cfn,exportName,moreResults)
    }else{
      throw new Error("Could not find export - "+exportName)
    }
  })
}

exports.handler =  function(event, context, callback) {
    let exportName = event.ResourceProperties.Name

    if ( event.RequestType === 'DELETE' ) {
      cfnResponse.send(event,context,"SUCCESS","{}")
      callback(null,"Successfully deleted custom resource")
      return
    }

    if ( exportName === undefined || exportName.length == 0 ) {
        console.log(event)
        cfnResponse.send(event,context,"FAILED","{}")
        callback(new Error("Export 'Name' parameter is required"))
        return
    }

    let cfn =  new AWS.CloudFormation()
    find(cfn,exportName)
    .then(foundValue => {
      console.log(`Export found: ${exportName}:${foundValue}`)
      cfnResponse.send(event,context,"SUCCESS",foundValue)
      callback(null,foundValue)
    })
    .catch(err => {
      cfnResponse.send(event,context,"FAILED",err.toString())
      callback(err)
    })
}

