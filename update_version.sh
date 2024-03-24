sed -i 's/versionName.*/versionName \"'$1'\"/g' ./android/app/build.gradle
sed -i 's/versionCode.*/versionCode '$2'/g' ./android/app/build.gradle
sed -i 's/\"appId.*/\"appId\": \"'$3'\",/g' ./capacitor.config.json
sed -i 's/\"appName.*/\"appName\": \"'"$4"'\",/g' ./capacitor.config.json
sed -i 's/package.*/package=\"'$3'\">/g' ./android/app/src/main/AndroidManifest.xml
sed -i 's/applicationId.*/applicationId \"'$3'\"/g' ./android/app/build.gradle
sed -i 's/storePassword.*/storePassword \"'$5'\"/g' ./android/app/build.gradle
sed -i 's/keyPassword.*/keyPassword \"'$5'\"/g' ./android/app/build.gradle
sed -i 's/"package_name\":.*/"package_name\": \"'$3'\"/g' ./android/app/google-services.json
sed -i 's/app_name.*/app_name\">'"$4"'<\/string>/g' ./android/app/src/main/res/values/strings.xml
sed -i 's/title_activity_main.*/title_activity_main\">'"$4"'<\/string>/g' ./android/app/src/main/res/values/strings.xml
cat << EOF > .env
WEBLATE_API_URL=$6
WEBLATE_API_KEY=$7
EOF