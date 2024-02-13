

```
sf org create scratch --set-default -f config/project-scratch-def.json
sf community create -n "Login Experience" -p "loginexp" -t "Build Your Own (LWR)"
sf project deploy start -m Role
ROLE_ID=`sf data query --query "select Id from UserRole where Name='Dummy'" --json | jq ".result.records[0].Id" -r`
sf data update record -s User -w "Name='User User'" -v "LanguageLocaleKey=en_US TimeZoneSidKey=Europe/Paris LocaleSidKey=da UserPreferencesUserDebugModePref=true UserPreferencesApexPagesDeveloperMode=true UserPermissionsInteractionUser=true UserPermissionsKnowledgeUser=true UserRoleId=$ROLE_ID"
sf project deploy start -m Profile
sf community publish -n "Login Experience"

# make CC Demo User profile member of the community


```