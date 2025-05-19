param location string = resourceGroup().location
param webAppName string = 'part-1'
param planName string = 'part1-plan'
param skuName string = 'F1'

resource appPlan 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: planName
  location: location
  sku: {
    name: skuName
    tier: 'Free'
  }
  kind: 'functionapp'
}

resource webApp 'Microsoft.Web/sites@2021-02-01' = {
  name: webAppName
  location: location
  properties: {
    serverFarmId: appPlan.id
  }
  identity: {
    type: 'SystemAssigned'
  }
}

resource accessRuleAllow 'Microsoft.Web/sites/config@2021-02-01' = {
  parent: webApp
  name: 'web'
  properties: {
    ipSecurityRestrictionsDefaultAction: 'Deny'
    ipSecurityRestrictions: [
      {
        ipAddress: '81.111.238.87/32'
        action: 'Allow'
        priority: 100
        name: 'Allow-MyIP'
      }
      {
        ipAddress: '0.0.0.0/0'
        action: 'Deny'
        priority: 200
        name: 'Deny-All'
      }
    ]
  }
}
