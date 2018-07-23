# Demonstrating Devops approach to Cross Account VPC Peering

## Introduction

Want to peer two VPCs cross account. How to manage this seamlessly using cloudformation?

## Start with the end in mind

* We want an operational peering connection allowing traffic between two VPCs in separate accounts
* We want to manage the deployment of the peering capability using cloudformation
* We want to describe the capability from one place, e.g. a single code repository
* We want a generic solution that is easily repeatable with different accounts / vpcs / networks

## Moving Parts

Cross Account VPC Peering is initiated by a requester - the first account - and accepted by a second account. The solution to automating this two step process is not always obvious: the answer is to create an **authorizer** role in the second account that permits the first to accept the vpc peering connection on its behalf.

> We start with the assumption that the **authorizer** role has already been created in the second account

For brevity we will now refer to
* The _requesting_ account as **Yin**
* The _accepting_ account as **Yang**

The sequence of events can be as follows:

* **Yin** defines lambda function to lookup cross account (e.g. **Yang's**) cfn stack exports
* **Yin** executes lambda function as custom resource - with **Yang's** _authorizer_ role - to return **Yang's** VPC Id and CIDR range
* **Yin** defines VPC Peering Connection using the following:
  * Its own VPC Id
  * **Yang's** VPC Id, account Id and _authorizer_ role ARN
* **Yin** updates its routing tables to add peering routes to **Yang's** VPC CIDR via the peering connection
* **Yin** defines lambda function to update routes for peering in **Yang's** account
* **Yin** executes lambda function as custom resource (?) - with **Yang's** _authorizer_ role - using the following inputs
    * **Yang's** subnet export names, which identify the correct routing tables
    * **Yin's** VPC CIDR

