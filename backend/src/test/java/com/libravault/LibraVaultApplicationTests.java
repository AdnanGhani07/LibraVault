package com.libravault;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class LibraVaultApplicationTests {

    @Test
    @DisplayName("Verify Spring Boot context boots cleanly and Flyway migrations execute")
    void contextLoads() {
        // Passes if Spring context, Flyway migrations V1 & V2, and JPA entities load without errors
    }
}
