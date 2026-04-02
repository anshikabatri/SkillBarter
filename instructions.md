Steps to Run
1. Clone the repository
   bashgit clone https://github.com/anshikabatri/SkillBarter.git
   cd skillbarter
2. Create your .env file
   Copy the example file and fill in the credentials:
   bashcp .env.example .env
   Then open .env and replace the placeholder values with the actual credentials
   shared with you by the project owner (via WhatsApp/email/Teams).
3. Add the SSL certificate
   Get the ca.pem file from the project owner and place it at:
   src/main/resources/ca.pem
   This file is required to connect to the Aiven cloud database.
4. Run the application
   bash./mvnw spring-boot:run
   Or run SkillbarterApplication.java directly from your IDE.