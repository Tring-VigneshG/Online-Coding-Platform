FROM openjdk:17
WORKDIR /app
COPY Main.java /app
RUN javac Main.java
CMD ["java", "Main"]