# salesforce-headless-identify-spa-poc #
This is an example of how to use the Salesforce Headless Login flow from a single page app (SPA). The repo describes how to configure the Salesforce org and how to use the included SPA (just a HTML page really) to do a headless login against the Salesforce org.

## Requirements ##
Below I assume you have the following installed and you know how to work the terminal.
* The Salesforce CLI installed and a Dev Hub configured
* `jq`

## Configuration ##

Create a scratch org, and configure it to allow Experience Cloud users to be created. 

**Please note:** The following pieces of configuration is being enabled using metadata:
* using `force-app/main/default/settings/Security.settings-meta.xml` we are enabling "Enable CORS for OAuth endpoints" on the "CORS"-page in Setup
* using `force-app/main/default/corsWhitelistOrigins/http_localhost_8080.corsWhitelistOrigin-meta.xml` we are enabling CORS for `http://localhost:8080` on the "CORS"-page in Setup
* using `force-app/main/default/settings/OauthOidc.settings-meta.xml` we are enabling "Allow Authorization Code and Credentials Flows" and "Require Proof Key for Code Exchange (PKCE) Extension for Supported Authorization Flows" on the "OAuth and OpenID Connect Settings"-page in Setup

``` bash
# create a scratch org
sf org create scratch --set-default -f config/project-scratch-def.json

# deploy metadata
sf project deploy start \
  -m Role \
  -m ApexClass \
  -m ApexComponent \
  -m ApexPage \
  -m Profile \
  -m DigitalExperienceBundle \
  -m DigitalExperienceConfig \
  -m CustomSite \
  -m Network \
  -m Settings \
  -m corswhitelistorigin

# get role id
ROLE_ID=`sf data query --query "select Id from UserRole where Name='Dummy'" --json | jq ".result.records[0].Id" -r`

# update user to set role
sf data update record -s User -w "Name='User User'" -v "LanguageLocaleKey=en_US \
  TimeZoneSidKey=Europe/Paris LocaleSidKey=da UserPreferencesUserDebugModePref=true \
  UserPreferencesApexPagesDeveloperMode=true UserPermissionsInteractionUser=true \
  UserPermissionsKnowledgeUser=true UserRoleId=$ROLE_ID"
```

Now use the Salesforce CLI to get the Experience Cloud site url for the `Login Experience` site
``` bash
BASE_URL=`sf org display --json | jq -r .result.instanceUrl | cut -d '.' -f 1`.scratch.my.site.com
echo "Base URL: $BASE_URL"
EXP_URL=$BASE_URL/loginexp
echo "Experience Cloud site: $EXP_URL"
CALLBACK_URL=$BASE_URL/services/apexrest/code/extraction
echo "Callback URL: $CALLBACK_URL"
```

In Salesforce Setup create a Connected App:
* Set a name, an API name and a contact email
* Enable OAuth Settings
* Set the `Callback URL` to the callback output above (ends in `/services/apexrest/code/extraction`)
* Enable the following scopes: `openid`, `id, profile, email, address, phone` and `web` (the last one only required if you would like to be able to open the Experience Cloud site directly from the SPA)
* Ensure `Require Proof Key for Code Exchange (PKCE) Extension for Supported Authorization Flows` is checked
* Enable `Enable Authorization Code and Credentials Flow`
* Enable `Require user credentials in the POST body for Authorization Code and Credentials Flow``
* **Disable** `Require Secret for Web Server Flow`
* If you do *NOT* wish to enable opening the Experience Cloud site from the SPA you may enable `Issue JSON Web Token (JWT)-based access tokens for named users`
* Save the Connected App
* Click the Continue-button
* Click the Manage-button to open the app policies and click Edit Policies
* Select `Admin approved users are pre-authorized` for Permitted Users
* Save the policies

Go back to the Connected App and grab the client ID (Consumer Key) and set it in the `clientId` variable in `html/index.html`. Also set the `Base URL` from above in the `baseUrl` variable in the same file.

Now edit the `CC Demo User` profile and ensure the Connected App you created is enabled for the Profile.

Now create a demo user in Salesforce with the below script. The user will be called John Doe and have the username `john.doe@example.com` and a password of `Saleforce1`.
``` bash
sf apex run -f scripts/apex/create_demouser_johndoe.apex
```

Run the single page app in a development webserver. The command below will serve the `html` directory on localhost port 8080. 

``` bash
npm run webserver
```

Open the app in a browser (running at [localhost:8080](http://localhost:8080)). Click the Login-button to perform a headless login towards Salesforce. Once the login has been performed the access token is used to request data about the user from the `/services/oauth2/userinfo` endpoint and the JSON data is displayed. If the access token is **not** a JWT there will be a button to open the Experience Cloud site using the `/secur/frontdoor.jsp` page supplying the JWT in the `sid` query string parameter.

Let's hope it works for you as well... :)
