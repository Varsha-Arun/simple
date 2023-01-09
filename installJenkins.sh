#! /bin/bash -e

IP_ADDR=localhost
URL=http://${IP_ADDR}:8080
USER="admin"
PASSWORD="Password@1"
JENKINS_CRUMB=""
JENKINS_API_TOKEN=""

install_jenkins() {
        # echo "Installing Jenkins"
        sudo apt update
        yes Y | sudo apt-get install python
        yes Y | sudo apt-get install jq

# Install Java SDK 11
                sudo apt install -y openjdk-11-jdk

# Download and Install Jenkins
                wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
                sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
                sudo apt update
                sudo apt -y install jenkins

# Start Jenkins
                sudo systemctl start jenkins

# Enable Jenkins to run on Boot
                sudo systemctl enable jenkins
                # echo "Done Installing Jenkins"
}


create_user() {
        echo "Creating User"
        init_password=$(sudo cat /var/lib/jenkins/secrets/initialAdminPassword)

# NEW ADMIN CREDENTIALS URL ENCODED USING PYTHON
                username=$(python -c "import urllib;print urllib.quote(raw_input(), safe='')" <<< $USER)
                new_password=$(python -c "import urllib;print urllib.quote(raw_input(), safe='')" <<< $PASSWORD)
                fullname=$(python -c "import urllib;print urllib.quote(raw_input(), safe='')" <<< "admin")
                email=$(python -c "import urllib;print urllib.quote(raw_input(), safe='')" <<< "admin@example.com")

# GET THE CRUMB AND COOKIE
                cookie_jar="$(mktemp)"
                full_crumb=$(curl -u "admin:${init_password}" --cookie-jar "$cookie_jar" $URL/crumbIssuer/api/xml?xpath=concat\(//crumbRequestField,%22:%22,//crumb\))
                arr_crumb=(${full_crumb//:/ })
                only_crumb=$(echo ${arr_crumb[1]})

                # echo "full_crumb: ${full_crumb}"
                # echo "only_crumb: ${only_crumb}"

# MAKE THE REQUEST TO CREATE AN ADMIN USER
                curl -X POST -u "admin:$init_password" $URL/setupWizard/createAdminUser \
                -H "Connection: keep-alive" \
                -H "Accept: application/json, text/javascript" \
                -H "X-Requested-With: XMLHttpRequest" \
                -H "$full_crumb" \
                -H "Content-Type: application/x-www-form-urlencoded" \
                --cookie $cookie_jar \
                --data-raw "username=$username&password1=$new_password&password2=$new_password&fullname=$fullname&email=$email&Jenkins-Crumb=$only_crumb&json=%7B%22username%22%3A%20%22$username%22%2C%20%22password1%22%3A%20%22$new_password%22%2C%20%22%24redact%22%3A%20%5B%22password1%22%2C%20%22password2%22%5D%2C%20%22password2%22%3A%20%22$new_password%22%2C%20%22fullname%22%3A%20%22$fullname%22%2C%20%22email%22%3A%20%22$email%22%2C%20%22Jenkins-Crumb%22%3A%20%22$only_crumb%22%7D&core%3Aapply=&Submit=Save&json=%7B%22username%22%3A%20%22$username%22%2C%20%22password1%22%3A%20%22$new_password%22%2C%20%22%24redact%22%3A%20%5B%22password1%22%2C%20%22password2%22%5D%2C%20%22password2%22%3A%20%22$new_password%22%2C%20%22fullname%22%3A%20%22$fullname%22%2C%20%22email%22%3A%20%22$email%22%2C%20%22Jenkins-Crumb%22%3A%20%22$only_crumb%22%7D"s
                # echo "Done Creating User"
}

install_plugins() {
        # echo "Installing Plugins"
        cookie_jar="$(mktemp)"
        full_crumb=$(curl -u "$USER:$PASSWORD" --cookie-jar "$cookie_jar" $URL/crumbIssuer/api/xml?xpath=concat\(//crumbRequestField,%22:%22,//crumb\))
        arr_crumb=(${full_crumb//:/ })
        only_crumb=$(echo ${arr_crumb[1]})
        # echo "full_crumb: ${full_crumb}"
        # echo "only_crumb: ${only_crumb}"
        # MAKE THE REQUEST TO DOWNLOAD AND INSTALL REQUIRED MODULES
        curl -X POST -u "$USER:$PASSWORD" $URL/pluginManager/installPlugins \
                -H 'Connection: keep-alive' \
                -H 'Accept: application/json, text/javascript, */*; q=0.01' \
                -H 'X-Requested-With: XMLHttpRequest' \
                -H "$full_crumb" \
                -H 'Content-Type: application/json' \
                -H 'Accept-Language: en,en-US;q=0.9,it;q=0.8' \
                --cookie $cookie_jar \
                --data-raw "{'dynamicLoad':true,'plugins':['cloudbees-folder','antisamy-markup-formatter','build-timeout','credentials-binding','timestamper','ws-cleanup','ant','gradle','workflow-aggregator','github-branch-source','pipeline-github-lib','pipeline-stage-view','git','ssh-slaves','matrix-auth','pam-auth','ldap','email-ext','mailer'],'Jenkins-Crumb':'$only_crumb'}"
        # echo "Done Installing Plugins"
}

install_artifactory_plugin() {
        # echo "Installing Artifactory Plugin"
        cookie_jar="$(mktemp)"
        full_crumb=$(curl -u "$USER:$PASSWORD" --cookie-jar "$cookie_jar" $URL/crumbIssuer/api/xml?xpath=concat\(//crumbRequestField,%22:%22,//crumb\))
        arr_crumb=(${full_crumb//:/ })
        only_crumb=$(echo ${arr_crumb[1]})
        # echo "full_crumb: ${full_crumb}"
        # echo "only_crumb: ${only_crumb}"
        # MAKE THE REQUEST TO DOWNLOAD AND INSTALL REQUIRED MODULES
        curl -X POST -u "$USER:$PASSWORD" $URL/pluginManager/installPlugins \
                -H 'Connection: keep-alive' \
                -H 'Accept: application/json, text/javascript, */*; q=0.01' \
                -H 'X-Requested-With: XMLHttpRequest' \
                -H "$full_crumb" \
                -H 'Content-Type: application/json' \
                -H 'Accept-Language: en,en-US;q=0.9,it;q=0.8' \
                --cookie $cookie_jar \
                --data-raw "{'dynamicLoad':true,'plugins':['artifactory'],'Jenkins-Crumb':'$only_crumb'}"
        # echo "Done Installing Artifactory Plugin"
}

confirm_jenkins_url() {
        # echo "Confirming Jenkins URL"
        url_urlEncoded=$(python -c "import urllib;print urllib.quote(raw_input(), safe='')" <<< "$URL")

        cookie_jar="$(mktemp)"
        full_crumb=$(curl -u "$USER:$PASSWORD" --cookie-jar "$cookie_jar" $URL/crumbIssuer/api/xml?xpath=concat\(//crumbRequestField,%22:%22,//crumb\))
        # echo "full_crumb: $full_crumb"
        arr_crumb=(${full_crumb//:/ })
        only_crumb=$(echo ${arr_crumb[1]})
        JENKINS_CRUMB=$only_crumb

        curl -X POST -u "$USER:$PASSWORD" $URL/setupWizard/configureInstance \
                -H 'Connection: keep-alive' \
                -H 'Accept: application/json, text/javascript, */*; q=0.01' \
                -H 'X-Requested-With: XMLHttpRequest' \
                -H "$full_crumb" \
                -H 'Content-Type: application/x-www-form-urlencoded' \
                -H 'Accept-Language: en,en-US;q=0.9,it;q=0.8' \
                --cookie $cookie_jar \
                --data-raw "rootUrl=$url_urlEncoded%2F&Jenkins-Crumb=$only_crumb&json=%7B%22rootUrl%22%3A%20%22$url_urlEncoded%2F%22%2C%20%22Jenkins-Crumb%22%3A%20%22$only_crumb%22%7D&core%3Aapply=&Submit=Save&json=%7B%22rootUrl%22%3A%20%22$url_urlEncoded%2F%22%2C%20%22Jenkins-Crumb%22%3A%20%22$only_crumb%22%7D"
        # echo "Done Confirming Jenkins URL"
}

get_api_token() {
        #echo "Get API Token"
        #echo "JENKINS_CRUMB = $JENKINS_CRUMB"
        #echo "curl -X POST -H 'Jenkins-Crumb:$JENKINS_CRUMB' --cookie /tmp/cookies $URL/me/descriptorByName/jenkins.security.ApiTokenProperty/generateNewToken?newTokenName=testtoken -u $USER:$PASSWORD"
        crumb=`curl -s --cookie-jar /tmp/cookies -u $USER:$PASSWORD $URL/crumbIssuer/api/json | jq -r '.crumb'`
        #echo "crumb = $crumb"
        #echo "curl -X POST -u "$USER:$PASSWORD" $URL/me/descriptorByName/jenkins.security.ApiTokenProperty/generateNewToken?newTokenName=testtoken -H "Jenkins-Crumb:"${crumb}"" --cookie /tmp/cookies"
        JENKINS_API_TOKEN=`curl -X POST -u "$USER:$PASSWORD" $URL/me/descriptorByName/jenkins.security.ApiTokenProperty/generateNewToken?newTokenName=testtoken -H "Jenkins-Crumb:"${crumb}"" --cookie /tmp/cookies | jq -r '.data.tokenValue'`
        #echo "JENKINS_API_TOKEN = $JENKINS_API_TOKEN"
        #data=json | jq -r '.status'
        #echo "data = $data"

        #JENKINS_API=`$json | jq -r '.data.tokenValue'`
        #echo "jenkins_api=$JENKINS_API"
        #echo "Done get API Token"
}

install_jenkins
create_user
install_plugins
confirm_jenkins_url
install_artifactory_plugin
get_api_token
echo "JENKINS_API=$JENKINS_API_TOKEN"
