FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/skillbarter-0.0.1-SNAPSHOT.jar app.jar

ENV SERVER_PORT=8082
EXPOSE 8082

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8082} -jar /app/app.jar"]