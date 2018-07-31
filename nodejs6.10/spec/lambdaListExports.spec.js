let AWS = require("aws-sdk-mock")
// TODO - update for cfn-response
describe("lambda should return matching cloudformation export in context of lambda roleArn", () => {
    let lambda = require('../lambda-list-exports')
    
    let page1Results = { 
        Exports: [ 
            {
                Name: "export-1", Value: "value 1"
            },
            {
                Name: "export-2", Value: "value 2"
            }
        ],
        NextToken: '2'
    }
    
    let page2Results = {
        Exports: [ 
            {
                Name: "export-4", Value: "value 4"
            }
        ],
        NextToken: '3'

    }

    let page3Results = {
        Exports: [ 
            {
                Name: "export-5", Value: "value 5"
            }
        ]

    }
    
    
    beforeEach(()=> {
        AWS.mock('CloudFormation','listExports',(params, cb) => {
            switch(params.NextToken){
                case '2':
                    cb(undefined, page2Results)
                    return
                case '3':
                    cb(undefined, page3Results)
                    return
                default:
                    cb(undefined, page1Results)
                    return
            }

        })
    })

    afterEach(() => {
        AWS.restore('CloudFormation')
    })
    
    describe('when results are contained in the first page', ()=> {

        it("should find an export by name from a list of cloudformation exports",(done) => {
            lambda.handler( { Name: "export-2" },undefined, (err,response) => {
                expect(err).toBeNull()
                expect(response.Value).toEqual("value 2")
                done()
            })
        })
    
        it("should fail to find an export not present in list of cloudformation exports", (done) => {
            lambda.handler( { Name: "export-3"}, undefined,(err,response) => {
                expect(err).toBeDefined()
                expect(response).toBeUndefined()
                done()
            })
        })
    })

    describe('when results are after the first page', () => {

        it('should find results from the second page', (done) => {
            lambda.handler( { Name: "export-4" },undefined, (err,response) => {
                expect(err).toBeNull()
                expect(response.Value).toEqual("value 4")
                done()
            })
        })
        it('should find results from the third page', (done) => {
            lambda.handler( { Name: "export-5"}, undefined,(err,response) => {
                expect(err).toBeNull()
                expect(response.Value).toEqual("value 5")
                done()
            })
        })
    })


})
