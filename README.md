# kv6012assessment
## Element 1: Roles & Security

To demonstrate a secure, role-based environment in Azure, three user roles have been assigned and network access has been restricted at the App Service level.

### 1. Root account (Subscription Owner)
- **Principal:** bicher.almesleh@northumbriaac.onmicrosoft.com  
- **Role:** Owner  
- **Scope:** Azure for Students subscription  
![Subscription Owner assignment](screenshots/subscription-owner.png)

### 2. Admin account (Resource-group Contributor)
- **Principal:** bicher.almesleh@northumbriaac.onmicrosoft.com  
- **Role:** Contributor  
- **Scope:** Resource group `kv6012_group`  
![Resource-group Contributor assignment](screenshots/rg-contributor.png)

### 3. Web-Admin account (Website Contributor)
- **Principal:** bicher.almesleh@northumbriaac.onmicrosoft.com  
- **Role:** Website Contributor  
- **Scope:** App Service `part-1`  
![App Service Website Contributor assignment](screenshots/app-website-contributor.png)

---

## Network Access Restrictions

Public network access is limited to specific IPs, with all other traffic denied by default.

- **Public network access:** Enabled from select virtual networks and IP addresses  
- **Unmatched rule action:** Deny  

| Priority | Name        | Source             | Action |
| -------- | ----------- | ------------------ | ------ |
| 100      | Allow-MyIP  | 81.111.238.87/32   | Allow  |
| 200      | Deny-All    | 0.0.0.0/0          | Deny   |

![Access restrictions configuration](screenshots/access-restrictions.png)
