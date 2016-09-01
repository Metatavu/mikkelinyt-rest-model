/*global module:false*/

var fs = require('fs');

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  
  grunt.initConfig({
    'curl': {
      'swagger-codegen':  {
        src: 'http://repo1.maven.org/maven2/io/swagger/swagger-codegen-cli/2.2.1/swagger-codegen-cli-2.2.1.jar',
        dest: 'swagger-codegen-cli.jar'
      }
    },
    'clean': {
      'remove-java-model': ['generated-sources'],
      'clean-java-model-cruft': [
         'generated-sources/docs', 
         'generated-sources/gradle', 
         'generated-sources/build.gradle',
         'generated-sources/build.sbt',
         'generated-sources/git_push.sh',
         'generated-sources/gradle.properties',
         'generated-sources/gradlew',
         'generated-sources/gradlew.bat',
         'generated-sources/LICENSE',
         'generated-sources/README.md',
         'generated-sources/settings.gradle',
         'generated-sources/src/test',
         'generated-sources/src/main/AndroidManifest.xml',
         'generated-sources/src/main/java/remove'
     ]
    },
    'shell': {
      'generate-java-model': {
        command : 'echo mv generated-sources/pom.xml generated-sources/pom.xml.before && \
          java -jar swagger-codegen-cli.jar generate \
          -i ./swagger.yaml \
          -l java \
          --api-package remove \
          --model-package fi.otavanopisto.mikkelinyt.model \
          --group-id fi.otavanopisto.mikkelinyt.mikkelinyt-rest-model \
          --artifact-id mikkelinyt-rest-model \
          --artifact-version `mvn -f generated-sources/pom.xml.before -q -Dexec.executable=\'echo\' -Dexec.args=\'${project.version}\' --non-recursive org.codehaus.mojo:exec-maven-plugin:1.3.1:exec` \
          --template-dir templates \
          --library jersey2 \
          --additional-properties dateLibrary=java8,excludeTests=true,invokerPackage=remove \
          -o generated-sources/'
      },
      'install-java-model': {
        command : 'mvn install',
        options: {
          execOptions: {
            cwd: 'generated-sources'
          }
        }
      },
    },
    'release-mikkelinyt-java-client': {
      command : 'mvn -B release:clean release:prepare release:perform',
      options: {
        execOptions: {
          cwd: 'generated-sources'
        }
      }
    }
  });
  
  grunt.registerTask('download-dependencies', 'if-missing:curl:swagger-codegen');
  grunt.registerTask('default', ['download-dependencies', 'clean:remove-java-model', 'shell:generate-java-model', 'clean:clean-java-model-cruft', 'shell:install-java-model' ]);
  
};