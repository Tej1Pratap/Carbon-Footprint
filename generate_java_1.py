import os

base_dir = r"c:\Users\Admin\OneDrive\Desktop\Carbon Footprint\backend\src\main\java\com\carbon\backend"
dirs = ['model', 'repository', 'service', 'controller', 'security', 'config']
for d in dirs:
    os.makedirs(os.path.join(base_dir, d), exist_ok=True)

files = {}

# Entities
files['model/ActivityLog.java'] = """package com.carbon.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Data
public class ActivityLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name="user_id", nullable=false) private User user;
    @Column(nullable = false) private String category;
    @Column(nullable = false) private String activityType;
    @Column(nullable = false) private Double quantity;
    @Column(nullable = false) private String unit;
    @Column(nullable = false) private LocalDateTime logDate;
    @Column(nullable = false) private Double emissionsKgCo2;
}
"""

files['model/EmissionFactor.java'] = """package com.carbon.backend.model;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "emission_factors")
@Data
public class EmissionFactor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String category;
    @Column(nullable = false) private String activityType;
    @Column(nullable = false) private String unit;
    @Column(nullable = false) private Double kgCo2PerUnit;
}
"""

files['model/User.java'] = """package com.carbon.backend.model;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private String username;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) private String password;
    @Column(nullable = false) private String role = "USER";
    private String sustainabilityPreference;
}
"""

# Repositories
files['repository/ActivityLogRepository.java'] = """package com.carbon.backend.repository;
import com.carbon.backend.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserId(Long userId);
}
"""

files['repository/EmissionFactorRepository.java'] = """package com.carbon.backend.repository;
import com.carbon.backend.model.EmissionFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, Long> {
    Optional<EmissionFactor> findByCategoryAndActivityTypeAndUnit(String category, String type, String unit);
}
"""

files['repository/UserRepository.java'] = """package com.carbon.backend.repository;
import com.carbon.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsByUsername(String username);
}
"""

# Security
files['security/JwtUtil.java'] = """package com.carbon.backend.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    private Key key() { return Keys.hmacShaKeyFor(jwtSecret.getBytes()); }

    public String generateJwtToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUserEmailFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try { Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(authToken); return true; } 
        catch (Exception e) { return false; }
    }
}
"""

files['security/JwtAuthFilter.java'] = """package com.carbon.backend.security;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtil.validateJwtToken(jwt)) {
                String email = jwtUtil.getUserEmailFromJwtToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception e) {}
        filterChain.doFilter(request, response);
    }
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) { return headerAuth.substring(7); }
        return null;
    }
}
"""

files['security/UserDetailsServiceImpl.java'] = """package com.carbon.backend.security;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired UserRepository userRepository;
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + email));
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRole())
                .build();
    }
}
"""

files['config/SecurityConfig.java'] = """package com.carbon.backend.config;
import com.carbon.backend.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
    @Autowired JwtAuthFilter jwtAuthFilter;
    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
            .authorizeHttpRequests()
            .requestMatchers("/api/auth/**", "/register.html", "/login.html", "/dashboard.html").permitAll()
            .anyRequest().authenticated();
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
"""

for rel_path, content in files.items():
    with open(os.path.join(base_dir, rel_path), "w") as f:
        f.write(content)
print("Generated Part 1")
