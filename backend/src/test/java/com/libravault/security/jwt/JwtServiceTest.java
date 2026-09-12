package com.libravault.security.jwt;

import com.libravault.model.entity.User;
import com.libravault.model.enums.Role;
import com.libravault.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;
    private UserPrincipal testUserPrincipal;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Standard 256-bit base64 secret for testing
        ReflectionTestUtils.setField(jwtService, "secretKey", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 3600000L); // 1 hour

        User user = User.builder()
                .id(1L)
                .email("testuser@libravault.com")
                .passwordHash("hashedpassword")
                .role(Role.ROLE_MEMBER)
                .fullName("Test Member")
                .build();

        testUserPrincipal = UserPrincipal.create(user);
    }

    @Test
    @DisplayName("Should generate valid JWT token with correct subject and claims")
    void testGenerateToken() {
        String token = jwtService.generateToken(testUserPrincipal);

        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("testuser@libravault.com");
        assertThat(jwtService.isTokenValid(token, testUserPrincipal)).isTrue();
    }

    @Test
    @DisplayName("Should detect invalid token for different user")
    void testInvalidUserToken() {
        String token = jwtService.generateToken(testUserPrincipal);

        User anotherUser = User.builder()
                .id(2L)
                .email("other@libravault.com")
                .passwordHash("hashedpassword")
                .role(Role.ROLE_MEMBER)
                .fullName("Other Member")
                .build();
        UserPrincipal otherPrincipal = UserPrincipal.create(anotherUser);

        assertThat(jwtService.isTokenValid(token, otherPrincipal)).isFalse();
    }

    @Test
    @DisplayName("Should detect expired token")
    void testExpiredToken() {
        // Set expiration to negative value
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", -1000L);
        String expiredToken = jwtService.generateToken(testUserPrincipal);

        assertThat(jwtService.isTokenValid(expiredToken, testUserPrincipal)).isFalse();
    }
}
