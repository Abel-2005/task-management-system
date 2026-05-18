pipeline {
  agent any
  environment {
    DOCKER_REGISTRY = 'local'
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Build Services') {
      parallel {
        stage('Build auth-service') {
          steps {
            dir('auth-service') {
              sh 'echo Building auth-service'
            }
          }
        }
        stage('Build task-service') {
          steps {
            dir('task-service') {
              sh 'echo Building task-service'
            }
          }
        }
      }
    }
    stage('Compose Up') {
      steps {
        sh 'docker-compose -f docker-compose.yml up -d --build'
      }
    }
  }
  post {
    always {
      echo 'Pipeline finished.'
    }
    cleanup {
      sh 'docker-compose -f docker-compose.yml down'
    }
  }
}
