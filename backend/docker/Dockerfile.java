FROM openjdk:17
WORKDIR /code
CMD ["sh", "-c", "javac Main.java && java Main"]
