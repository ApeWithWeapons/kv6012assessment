// iac/main.bicep

@description('Location for all resources')
param location string = resourceGroup().location

@description('Name of the App Service Plan')
param planName string = 'part1-plan'

@description('Tier for the App Service Plan')
param skuName string = 'F1'

@description('Name of the Web App')
param webAppName string = 'part-1'

//
// App Service Plan
//
resource appPlan 'Microsoft.Web/serverfarms@2021-02-01' = {
  name: planName
  location: location
  sku: {
    name: skuName
    tier: 'Free'
  }
}

//
// Web App with system-assigned identity
//
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

//
// Network access restrictions
//
resource accessConfig 'Microsoft.Web/sites/config@2021-02-01' = {
  parent: webApp
  name: 'web'
  properties: {
    publicNetworkAccess: 'Enabled'
    ipSecurityRestrictionsDefaultAction: 'Deny'
    ipSecurityRestrictions: [
      {
        name: 'Allow-MyIP'
        ipAddress: '81.111.238.87/32'
        action: 'Allow'
        priority: 100
      }
      {
        name: 'Deny-All'
        ipAddress: '0.0.0.0/0'
        action: 'Deny'
        priority: 200
      }
    ]
  }
}
