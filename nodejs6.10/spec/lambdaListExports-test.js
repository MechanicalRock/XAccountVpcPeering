let AWS = require("aws-sdk-mock")
describe("lambda should return matching cloudformation export in context of lambda roleArn", () => {
    let lambda = require('../lambda-list-exports')
    let makeCfResponse = function() {
        AWS.mock('CloudFormation','listExports',(cb) => {
            cb(undefined, { 
                Exports: [ 
                    {
                        Name: "export-1", Value: "value 1"
                    },
                    {
                        Name: "export-2", Value: "value 2"
                    }
                ] 
            })
        })
    }

    it("should find an export by name from a list of cloudformation exports",(done) => {
        makeCfResponse()
        lambda.handler( { Name: "export-2" },undefined, (err,response) => {
            expect(err).toBeNull()
            expect(response.Value).toEqual("value 2")
            done()
        })
        AWS.restore('CloudFormation')
    })

    it("should fail to find an export not present in list of cloudformation exports", (done) => {
        makeCfResponse()
        lambda.handler( { Name: "export-3"}, undefined,(err,response) => {
            expect(err).toBeDefined()
            expect(response).toBeUndefined()
            done()
        })
        AWS.restore('CloudFormation')
    })
})
