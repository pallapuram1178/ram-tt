# Stage 1: Build Spring Boot JAR with Maven & Java 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy pom.xml and pre-fetch dependencies for layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build executable JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Production JRE 21 Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Persistent directory for embedded H2 database
RUN mkdir -p /app/data

# Copy JAR from build stage
COPY --from=build /app/target/servicedesk-pro-backend-1.0.0.jar app.jar

# Application runs on port 5000
EXPOSE 5000

ENV SERVER_PORT=5000
ENV SPRING_DATASOURCE_URL=jdbc:h2:file:/app/data/servicedesk;DB_CLOSE_DELAY=-1;AUTO_SERVER=TRUE

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]
