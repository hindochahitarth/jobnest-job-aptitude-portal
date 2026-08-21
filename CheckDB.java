import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/jobnest_db";
        String user = "jobnest";
        String password = "jobnest_password"; // Assuming this is the password based on typical local setup, or I can just use no password if it's trust.
        
        // Actually, if it's Spring Boot, I can look at application.properties!
    }
}
