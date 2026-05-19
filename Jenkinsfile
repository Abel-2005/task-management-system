pipeline {
  

    agent any
    tools {
    jdk 'jdk17'
}

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Auth Service') {
            steps {
                dir('auth-service') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Docker Compose Build') {
            steps {
                bat 'docker compose up --build -d'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}