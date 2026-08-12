package com.carbon.backend;

import com.carbon.backend.repository.ActivityLogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class QueryTest {
    @Autowired
    private ActivityLogRepository repo;

    @Test
    public void testQuery() {
        System.out.println("LOGS FOUND: " + repo.findByOrganizationId(2L).size());
    }
}
